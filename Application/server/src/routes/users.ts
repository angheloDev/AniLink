import { Router } from 'express';
import mongoose from 'mongoose';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { Listing } from '../models/Listing';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { User } from '../models/User';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.post(
  '/:id/block',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (id === req.userId) throw new HttpError(400, 'You cannot block yourself');
    if (!mongoose.isValidObjectId(id) || !(await User.exists({ _id: id }))) throw new HttpError(404, 'User not found');
    await User.updateOne({ _id: req.userId }, { $addToSet: { blocked: id } });
    res.json({ blocked: true });
  }),
);

usersRouter.delete(
  '/:id/block',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'User not found');
    await User.updateOne({ _id: req.userId }, { $pull: { blocked: id } });
    res.json({ blocked: false });
  }),
);

usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'User not found');
    const u = await User.findById(id);
    if (!u) throw new HttpError(404, 'User not found');
    const [reviews, listingsCount, completedOrders] = await Promise.all([
      Review.find({ sellerId: u._id }).sort({ createdAt: -1 }).limit(30),
      Listing.countDocuments({ sellerId: u._id, status: 'active' }),
      Order.countDocuments({ sellerId: u._id, status: 'completed' }),
    ]);
    const buyers = await User.find({ _id: { $in: reviews.map((r) => r.buyerId) } });
    const byId = new Map(buyers.map((b) => [String(b._id), b]));
    res.json({
      user: {
        id: String(u._id),
        name: u.name,
        photoUrl: u.photoUrl ?? null,
        barangay: u.barangay ?? null,
        farm: u.farm ? { name: u.farm.name ?? '', description: u.farm.description ?? '', crops: u.farm.crops ?? [] } : null,
        verified: u.verification?.status === 'verified',
        ratingAvg: u.ratingAvg,
        ratingCount: u.ratingCount,
        listingsCount,
        completedOrders,
        createdAt: u.createdAt,
      },
      reviews: reviews.map((r) => ({
        id: String(r._id),
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        buyer: { id: String(r.buyerId), name: byId.get(String(r.buyerId))?.name ?? 'Buyer', photoUrl: byId.get(String(r.buyerId))?.photoUrl ?? null },
      })),
    });
  }),
);
