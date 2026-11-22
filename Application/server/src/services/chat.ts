import mongoose from 'mongoose';
import { HttpError } from '../http';
import { Conversation, Message, Offer, type ConversationDoc, type MessageDoc, type OfferDoc } from '../models/Chat';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { notify } from './notifications';
import { emitToUsers } from './realtime';

export function toOfferDTO(o: OfferDoc) {
  return {
    id: String(o._id),
    conversationId: String(o.conversationId),
    listingId: String(o.listingId),
    fromUserId: String(o.fromUserId),
    toUserId: String(o.toUserId),
    pricePerUnit: o.pricePerUnit,
    quantity: o.quantity,
    delivery: o.delivery,
    date: o.date,
    status: o.status,
    orderId: o.orderId ? String(o.orderId) : null,
    createdAt: o.createdAt,
  };
}

export async function toMessageDTOs(msgs: MessageDoc[]) {
  const offerIds = msgs.filter((m) => m.offerId).map((m) => m.offerId);
  const offers = offerIds.length ? await Offer.find({ _id: { $in: offerIds } }) : [];
  const byId = new Map(offers.map((o) => [String(o._id), toOfferDTO(o)]));
  return msgs.map((m) => ({
    id: String(m._id),
    conversationId: String(m.conversationId),
    senderId: String(m.senderId),
    type: m.type,
    text: m.text ?? null,
    imageUrl: m.imageUrl ?? null,
    offer: m.offerId ? (byId.get(String(m.offerId)) ?? null) : null,
    orderId: m.orderId ? String(m.orderId) : null,
    readAt: m.readAt ?? null,
    createdAt: m.createdAt,
  }));
}

export async function getConversationFor(id: string, userId: string): Promise<ConversationDoc> {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Conversation not found');
  const conv = await Conversation.findById(id);
  if (!conv) throw new HttpError(404, 'Conversation not found');
  if (String(conv.buyerId) !== userId && String(conv.sellerId) !== userId) throw new HttpError(403, 'Not your conversation');
  return conv;
}

export async function assertNotBlocked(conv: ConversationDoc, userId: string): Promise<void> {
  const other = String(conv.buyerId) === userId ? String(conv.sellerId) : String(conv.buyerId);
  const [me, them] = await Promise.all([User.findById(userId), User.findById(other)]);
  const has = (u: typeof me, id: string) => !!u?.blocked.some((b) => String(b) === id);
  if (has(me, other) || has(them, userId)) throw new HttpError(403, 'You cannot message this user');
}

export const otherParty =(conv: ConversationDoc, userId: string): string =>
  String(conv.buyerId) === userId ? String(conv.sellerId) : String(conv.buyerId);

export async function toConversationDTOs(convs: ConversationDoc[], userId: string) {
  const listings = await Listing.find({ _id: { $in: convs.map((c) => c.listingId) } });
  const lById = new Map(listings.map((l) => [String(l._id), l]));
  const others = await User.find({ _id: { $in: convs.map((c) => otherParty(c, userId)) } });
  const uById = new Map(others.map((u) => [String(u._id), u]));
  return convs.map((c) => {
    const l = lById.get(String(c.listingId));
    const o = uById.get(otherParty(c, userId));
    const isBuyer = String(c.buyerId) === userId;
    return {
      id: String(c._id),
      listing: l ? { id: String(l._id), title: l.title, photo: l.photos[0] ?? null, price: l.price, unit: l.unit, category: l.category } : null,
      other: { id: String(o?._id ?? ''), name: o?.name ?? 'Unknown', photoUrl: o?.photoUrl ?? null, verified: o?.verification?.status === 'verified' },
      role: isBuyer ? ('buyer' as const) : ('seller' as const),
      lastMessage: c.lastMessage,
      lastAt: c.lastAt,
      unread: isBuyer ? c.unread.buyer : c.unread.seller,
    };
  });
}

function preview(m: { type: string; text?: string }): string {
  if (m.type === 'image') return '📷 Photo';
  if (m.type === 'offer') return '💰 ' + (m.text ?? 'Offer');
  return m.text ?? '';
}

export async function addMessage(
  conv: ConversationDoc,
  senderId: string,
  data: { type: 'text' | 'image' | 'offer' | 'system'; text?: string; imageUrl?: string; offerId?: string; orderId?: string },
  opts: { notifyOther?: boolean } = {},
) {
  const msg = await Message.create({ conversationId: conv._id, senderId, ...data });
  const other = otherParty(conv, senderId);
  const unreadField = String(conv.buyerId) === other ? 'unread.buyer' : 'unread.seller';
  await Conversation.updateOne({ _id: conv._id }, { $set: { lastMessage: preview(data), lastAt: new Date() }, $inc: { [unreadField]: 1 } });
  const [dto] = await toMessageDTOs([msg]);
  emitToUsers([String(conv.buyerId), String(conv.sellerId)], 'message:new', { message: dto });
  if (opts.notifyOther !== false) {
    const sender = await User.findById(senderId);
    notify(other, {
      type: data.type === 'offer' ? 'offer' : 'message',
      title: sender?.name ?? 'New message',
      body: preview(data),
      route: `/chat/${String(conv._id)}`,
    }).catch((e) => console.error('notify failed', e));
  }
  return { msg, dto };
}

export async function markRead(conv: ConversationDoc, userId: string): Promise<void> {
  const unreadField = String(conv.buyerId) === userId ? 'unread.buyer' : 'unread.seller';
  await Conversation.updateOne({ _id: conv._id }, { $set: { [unreadField]: 0 } });
  await Message.updateMany({ conversationId: conv._id, senderId: { $ne: userId }, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  emitToUsers([String(conv.buyerId), String(conv.sellerId)], 'message:read', { conversationId: String(conv._id), userId });
}
