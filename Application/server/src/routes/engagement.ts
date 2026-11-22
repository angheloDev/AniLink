import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { Alert } from '../models/Alert';
import { Notification } from '../models/Notification';
import { Report } from '../models/Report';
import { toNotificationDTO } from '../services/notifications';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await Notification.find({ userId: req.userId }).sort({ _id: -1 }).limit(100);
    res.json({ items: items.map(toNotificationDTO) });
  }),
);

notificationsRouter.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    res.json({ count: await Notification.countDocuments({ userId: req.userId, readAt: { $exists: false } }) });
  }),
);

notificationsRouter.post(
  '/read',
  asyncHandler(async (req, res) => {
    const { ids } = z.object({ ids: z.array(z.string()).optional() }).parse(req.body ?? {});
    const filter = { userId: req.userId, readAt: { $exists: false }, ...(ids ? { _id: { $in: ids.filter((i) => mongoose.isValidObjectId(i)) } } : {}) };
    await Notification.updateMany(filter, { readAt: new Date() });
    res.json({ ok: true });
  }),
);

export const alertsRouter = Router();
alertsRouter.use(requireAuth);

const dto = (a: InstanceType<typeof Alert>) => ({ id: String(a._id), crop: a.crop, maxPrice: a.maxPrice ?? null, barangay: a.barangay ?? null, createdAt: a.createdAt });

alertsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ items: (await Alert.find({ userId: req.userId }).sort({ _id: -1 })).map(dto) });
  }),
);

alertsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = z.object({ crop: z.string().trim().min(2), maxPrice: z.number().positive().optional(), barangay: z.string().optional() }).parse(req.body);
    const a = await Alert.create({ ...b, userId: req.userId });
    res.status(201).json({ alert: dto(a) });
  }),
);

alertsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const r = mongoose.isValidObjectId(id) ? await Alert.deleteOne({ _id: id, userId: req.userId }) : { deletedCount: 0 };
    if (!r.deletedCount) throw new HttpError(404, 'Alert not found');
    res.json({ ok: true });
  }),
);

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = z.object({ targetType: z.enum(['user', 'listing']), targetId: z.string().min(1), reason: z.string().trim().max(500).default('') }).parse(req.body);
    await Report.create({ ...b, reporterId: req.userId });
    res.status(201).json({ ok: true });
  }),
);
