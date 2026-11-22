import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { Offer } from '../models/Chat';
import { Listing } from '../models/Listing';
import { Order } from '../models/Order';
import { User, toUserDTO } from '../models/User';
import { toListingDTOs } from '../services/listingDto';
import { scheduleVerification } from '../services/verification';

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account no longer exists');
    res.json({ user: toUserDTO(user) });
  }),
);

meRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const me = new mongoose.Types.ObjectId(req.userId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [activeListings, viewsAgg, pendingOffers, openOrders, earningsAgg, recent] = await Promise.all([
      Listing.countDocuments({ sellerId: me, status: 'active' }),
      Listing.aggregate([{ $match: { sellerId: me } }, { $group: { _id: null, views: { $sum: '$views' } } }]),
      Offer.countDocuments({ toUserId: me, status: 'pending' }),
      Order.countDocuments({ sellerId: me, status: { $in: ['pending_payment', 'paid', 'preparing', 'ready_for_pickup', 'out_for_delivery'] } }),
      Order.aggregate([{ $match: { sellerId: me, status: 'completed', updatedAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Offer.find({ toUserId: me, status: 'pending' }).sort({ createdAt: -1 }).limit(5),
    ]);
    const [listings, buyers] = await Promise.all([
      Listing.find({ _id: { $in: recent.map((o) => o.listingId) } }),
      User.find({ _id: { $in: recent.map((o) => o.fromUserId) } }),
    ]);
    const lById = new Map(listings.map((l) => [String(l._id), l]));
    const bById = new Map(buyers.map((b) => [String(b._id), b]));
    res.json({
      activeListings,
      views: viewsAgg[0]?.views ?? 0,
      pendingOffers,
      openOrders,
      earningsThisMonth: earningsAgg[0]?.total ?? 0,
      recentOffers: recent.map((o) => ({
        id: String(o._id),
        conversationId: String(o.conversationId),
        listingId: String(o.listingId),
        listingTitle: lById.get(String(o.listingId))?.title ?? '',
        unit: lById.get(String(o.listingId))?.unit ?? 'kg',
        buyerId: String(o.fromUserId),
        buyerName: bById.get(String(o.fromUserId))?.name ?? 'Buyer',
        buyerPhotoUrl: bById.get(String(o.fromUserId))?.photoUrl ?? null,
        pricePerUnit: o.pricePerUnit,
        quantity: o.quantity,
        createdAt: o.createdAt,
      })),
    });
  }),
);

meRouter.get(
  '/favorites',
  asyncHandler(async (req, res) => {
    const docs = await Listing.find({ favoritedBy: req.userId }).sort({ createdAt: -1 });
    res.json({ items: await toListingDTOs(docs, req.userId) });
  }),
);

meRouter.post(
  '/verification',
  asyncHandler(async (req, res) => {
    const b = z.object({ idPhotoUrl: z.string().min(1), farmPhotoUrl: z.string().min(1) }).parse(req.body);
    const current = await User.findById(req.userId);
    if (!current) throw new HttpError(401, 'Account no longer exists');
    if (current.verification.status === 'verified') {
      res.json({ user: toUserDTO(current) });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { 'verification.status': 'pending', 'verification.idPhotoUrl': b.idPhotoUrl, 'verification.farmPhotoUrl': b.farmPhotoUrl } },
      { new: true },
    );
    scheduleVerification(String(req.userId));
    res.json({ user: toUserDTO(user!) });
  }),
);

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  photoUrl: z.string().optional(),
  phone: z.string().optional(),
  barangay: z.string().optional(),
  role: z.enum(['farmer', 'buyer']).optional(),
  farm: z.object({ name: z.string().optional(), description: z.string().optional(), crops: z.array(z.string()).default([]) }).optional(),
  language: z.enum(['en', 'tl']).optional(),
  onboarded: z.boolean().optional(),
});

meRouter.patch(
  '/',
  asyncHandler(async (req, res) => {
    const patch = patchSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.userId, { $set: patch }, { new: true });
    if (!user) throw new HttpError(401, 'Account no longer exists');
    res.json({ user: toUserDTO(user) });
  }),
);
