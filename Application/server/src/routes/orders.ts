import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { Listing } from '../models/Listing';
import { Order, ORDER_STATUSES, type OrderDoc, type OrderStatus } from '../models/Order';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { notify } from '../services/notifications';
import { nextStatuses, toOrderDTO } from '../services/orders';
import { emitToUsers } from '../services/realtime';

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

async function loadOrder(id: string, userId: string): Promise<OrderDoc> {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Order not found');
  const o = await Order.findById(id);
  if (!o) throw new HttpError(404, 'Order not found');
  if (String(o.buyerId) !== userId && String(o.sellerId) !== userId) throw new HttpError(403, 'Not your order');
  return o;
}

async function publish(o: OrderDoc, notifyUserId: string, title: string) {
  const dto = await toOrderDTO(o);
  emitToUsers([String(o.buyerId), String(o.sellerId)], 'order:update', { order: dto });
  notify(notifyUserId, { type: 'order', title, body: o.title, route: `/order/${String(o._id)}` }).catch((e) => console.error('notify failed', e));
  return dto;
}

ordersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const selling = req.query.role === 'selling';
    const docs = await Order.find(selling ? { sellerId: req.userId } : { buyerId: req.userId }).sort({ createdAt: -1 });
    res.json({ items: await Promise.all(docs.map(toOrderDTO)) });
  }),
);

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ order: await toOrderDTO(await loadOrder(String(req.params.id), req.userId!)) });
  }),
);

ordersRouter.post(
  '/:id/pay',
  asyncHandler(async (req, res) => {
    const { method } = z.object({ method: z.enum(['ewallet_a', 'ewallet_b', 'bank', 'cash']) }).parse(req.body);
    const o = await loadOrder(String(req.params.id), req.userId!);
    if (String(o.buyerId) !== req.userId) throw new HttpError(403, 'Only the buyer can pay');
    // One atomic step: only an order still awaiting payment can move on, and the status change,
    // history entry and payment details are written together (so a concurrent cancel cannot be overwritten).
    const to: OrderStatus = method === 'cash' ? 'preparing' : 'paid';
    const claimed = await Order.findOneAndUpdate(
      { _id: o._id, status: 'pending_payment' },
      { $set: { paymentMethod: method, paymentRef: `AL-${randomBytes(4).toString('hex').toUpperCase()}`, status: to }, $push: { history: { status: to, at: new Date() } } },
      { new: true },
    );
    if (!claimed) throw new HttpError(409, 'This order is not awaiting payment');
    res.json({ order: await publish(claimed, String(claimed.sellerId), method === 'cash' ? 'New cash order' : 'Payment received') });
  }),
);

ordersRouter.post(
  '/:id/advance',
  asyncHandler(async (req, res) => {
    const { to } = z.object({ to: z.enum(ORDER_STATUSES) }).parse(req.body);
    const o = await loadOrder(String(req.params.id), req.userId!);
    if (String(o.sellerId) !== req.userId) throw new HttpError(403, 'Only the seller can update this order');
    if (!nextStatuses(o).includes(to)) throw new HttpError(409, `Cannot move from ${o.status} to ${to}`);
    const claimed = await Order.findOneAndUpdate({ _id: o._id, status: o.status }, { status: to, $push: { history: { status: to, at: new Date() } } }, { new: true });
    if (!claimed) throw new HttpError(409, 'Order changed, please refresh');
    res.json({ order: await publish(claimed, String(claimed.buyerId), `Order ${to.replace(/_/g, ' ')}`) });
  }),
);

ordersRouter.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const o = await loadOrder(String(req.params.id), req.userId!);
    const claimed = await Order.findOneAndUpdate(
      { _id: o._id, status: { $in: ['pending_payment', 'paid', 'preparing'] } },
      { status: 'cancelled', $push: { history: { status: 'cancelled', at: new Date() } } },
      { new: true },
    );
    if (!claimed) throw new HttpError(409, 'This order can no longer be cancelled');
    await Listing.updateOne({ _id: claimed.listingId }, { $inc: { stock: claimed.quantity } });
    await Listing.updateOne({ _id: claimed.listingId, status: 'soldout' }, { status: 'active' });
    const other = String(claimed.buyerId) === req.userId ? String(claimed.sellerId) : String(claimed.buyerId);
    res.json({ order: await publish(claimed, other, 'Order cancelled') });
  }),
);

ordersRouter.post(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const b = z.object({ rating: z.number().int().min(1).max(5), text: z.string().trim().max(1000).default('') }).parse(req.body);
    const o = await loadOrder(String(req.params.id), req.userId!);
    if (String(o.buyerId) !== req.userId) throw new HttpError(403, 'Only the buyer can review');
    if (o.status !== 'completed') throw new HttpError(409, 'You can review once the order is completed');
    if (await Review.exists({ orderId: o._id })) throw new HttpError(409, 'You already reviewed this order');
    let review;
    try {
      review = await Review.create({ orderId: o._id, listingId: o.listingId, sellerId: o.sellerId, buyerId: o.buyerId, rating: b.rating, text: b.text });
    } catch (e) {
      if ((e as { code?: number }).code === 11000) throw new HttpError(409, 'You already reviewed this order');
      throw e;
    }
    const [agg] = await Review.aggregate([{ $match: { sellerId: o.sellerId } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
    await User.updateOne({ _id: o.sellerId }, { ratingAvg: Math.round(agg.avg * 100) / 100, ratingCount: agg.n });
    notify(String(o.sellerId), { type: 'order', title: 'New review', body: `${b.rating}★ ${o.title}`, route: `/seller/${String(o.sellerId)}` }).catch(() => undefined);
    res.status(201).json({ review: { id: String(review._id), rating: review.rating, text: review.text } });
  }),
);
