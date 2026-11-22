import { Router } from 'express';
import { asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { PriceGuide } from '../models/PriceGuide';

export const priceGuideRouter = Router();
priceGuideRouter.use(requireAuth);

priceGuideRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await PriceGuide.find().sort({ crop: 1 }).lean();
    res.json({
      items: items.map((g) => ({ id: String(g._id), crop: g.crop, category: g.category, unit: g.unit, low: g.low, avg: g.avg, high: g.high, trend: g.trend })),
    });
  }),
);
