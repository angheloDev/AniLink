import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { Conversation, Message, Offer } from '../models/Chat';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { addMessage, assertNotBlocked, getConversationFor, markRead, otherParty, toConversationDTOs, toMessageDTOs, toOfferDTO } from '../services/chat';
import { notify } from '../services/notifications';
import { createOrderFromOffer } from '../services/orders';
import { applyOfferAction, validateOfferAgainstListing } from '../services/offers';
import { emitToUsers } from '../services/realtime';

export const conversationsRouter = Router();
export const offersRouter = Router();
conversationsRouter.use(requireAuth);
offersRouter.use(requireAuth);

conversationsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { listingId } = z.object({ listingId: z.string() }).parse(req.body);
    if (!mongoose.isValidObjectId(listingId)) throw new HttpError(404, 'Listing not found');
    const listing = await Listing.findById(listingId);
    if (!listing) throw new HttpError(404, 'Listing not found');
    if (String(listing.sellerId) === req.userId) throw new HttpError(400, 'This is your own listing');
    const [me, seller] = await Promise.all([User.findById(req.userId), User.findById(listing.sellerId)]);
    const blocked = (a?: typeof me, b?: string) => !!a?.blocked.some((x) => String(x) === b);
    if (blocked(me, String(listing.sellerId)) || blocked(seller, req.userId)) throw new HttpError(403, 'You cannot message this user');
    let conv = await Conversation.findOne({ listingId, buyerId: req.userId });
    if (!conv) conv = await Conversation.create({ listingId, buyerId: req.userId, sellerId: listing.sellerId });
    const [dto] = await toConversationDTOs([conv], req.userId!);
    res.json({ conversation: dto });
  }),
);

conversationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const convs = await Conversation.find({ $or: [{ buyerId: req.userId }, { sellerId: req.userId }] }).sort({ lastAt: -1 });
    res.json({ items: await toConversationDTOs(convs, req.userId!) });
  }),
);

conversationsRouter.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const conv = await getConversationFor(String(req.params.id), req.userId!);
    const before = typeof req.query.before === 'string' && mongoose.isValidObjectId(req.query.before) ? req.query.before : undefined;
    const msgs = await Message.find({ conversationId: conv._id, ...(before ? { _id: { $lt: before } } : {}) })
      .sort({ _id: -1 })
      .limit(50);
    res.json({ items: await toMessageDTOs(msgs) });
  }),
);

conversationsRouter.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const conv = await getConversationFor(String(req.params.id), req.userId!);
    await assertNotBlocked(conv, req.userId!);
    const b = z
      .object({ type: z.enum(['text', 'image']), text: z.string().trim().max(4000).optional(), imageUrl: z.string().optional() })
      .refine((v) => (v.type === 'text' ? !!v.text : !!v.imageUrl), 'Message is empty')
      .parse(req.body);
    const { dto } = await addMessage(conv, req.userId!, b);
    res.status(201).json({ message: dto });
  }),
);

conversationsRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const conv = await getConversationFor(String(req.params.id), req.userId!);
    await markRead(conv, req.userId!);
    res.json({ ok: true });
  }),
);

const termsSchema = z.object({
  pricePerUnit: z.number().positive(),
  quantity: z.number().positive(),
  delivery: z.enum(['pickup', 'delivery']),
  date: z.string().min(1),
});

const offerLabel = (t: { pricePerUnit: number; quantity: number }) => `₱${t.pricePerUnit} × ${t.quantity}`;

conversationsRouter.post(
  '/:id/offers',
  asyncHandler(async (req, res) => {
    const conv = await getConversationFor(String(req.params.id), req.userId!);
    await assertNotBlocked(conv, req.userId!);
    const terms = termsSchema.parse(req.body);
    const listing = await Listing.findById(conv.listingId);
    if (!listing) throw new HttpError(404, 'Listing not found');
    validateOfferAgainstListing(terms, listing);
    await Offer.updateMany({ conversationId: conv._id, status: 'pending' }, { status: 'superseded' });
    const offer = await Offer.create({ ...terms, conversationId: conv._id, listingId: conv.listingId, fromUserId: req.userId, toUserId: otherParty(conv, req.userId!) });
    const { dto } = await addMessage(conv, req.userId!, { type: 'offer', text: offerLabel(terms), offerId: String(offer._id) });
    emitToUsers([String(conv.buyerId), String(conv.sellerId)], 'offer:update', { offer: toOfferDTO(offer) });
    res.status(201).json({ message: dto, offer: toOfferDTO(offer) });
  }),
);

offersRouter.post(
  '/:id/respond',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Offer not found');
    const offer = await Offer.findById(id);
    if (!offer) throw new HttpError(404, 'Offer not found');
    const body = z.object({ action: z.enum(['accept', 'decline', 'counter']), counter: termsSchema.optional() }).parse(req.body);
    const conv = await getConversationFor(String(offer.conversationId), req.userId!);
    await assertNotBlocked(conv, req.userId!);
    const state = {
      fromUserId: String(offer.fromUserId),
      toUserId: String(offer.toUserId),
      pricePerUnit: offer.pricePerUnit,
      quantity: offer.quantity,
      delivery: offer.delivery,
      date: offer.date,
      status: offer.status,
    };
    const result = applyOfferAction(state, req.userId!, body.action, body.counter);
    const listing = await Listing.findById(offer.listingId);
    if (!listing) throw new HttpError(404, 'Listing not found');
    if (body.action === 'counter') validateOfferAgainstListing(body.counter!, listing);

    // Atomic claim: only one concurrent responder can move the offer out of "pending".
    const claimed = await Offer.findOneAndUpdate({ _id: offer._id, status: 'pending' }, { status: result.offer.status }, { new: true });
    if (!claimed) throw new HttpError(409, 'This offer is no longer pending');

    const users = [String(conv.buyerId), String(conv.sellerId)];
    let newOffer;
    if (body.action === 'accept') {
      try {
        const order = await createOrderFromOffer(String(offer._id));
        claimed.orderId = order.id as never;
        await claimed.save();
        await addMessage(conv, req.userId!, { type: 'system', text: 'order_created', orderId: order.id }, { notifyOther: false });
      } catch (e) {
        await Offer.updateOne({ _id: offer._id }, { status: 'pending', $unset: { orderId: 1 } });
        throw e;
      }
    } else if (body.action === 'counter' && result.newOffer) {
      const created = await Offer.create({
        ...result.newOffer,
        conversationId: conv._id,
        listingId: offer.listingId,
        fromUserId: req.userId,
        toUserId: offer.fromUserId,
      });
      await addMessage(conv, req.userId!, { type: 'offer', text: offerLabel(created), offerId: String(created._id) });
      newOffer = toOfferDTO(created);
      emitToUsers(users, 'offer:update', { offer: newOffer });
    }
    if (body.action !== 'counter') {
      notify(String(offer.fromUserId), {
        type: 'offer',
        title: body.action === 'accept' ? 'Offer accepted' : 'Offer declined',
        body: offerLabel(offer),
        route: `/chat/${String(conv._id)}`,
      }).catch((e) => console.error('notify failed', e));
    }
    const fresh = await Offer.findById(offer._id);
    const dto = toOfferDTO(fresh!);
    emitToUsers(users, 'offer:update', { offer: dto });
    res.json({ offer: dto, ...(newOffer ? { newOffer } : {}) });
  }),
);
