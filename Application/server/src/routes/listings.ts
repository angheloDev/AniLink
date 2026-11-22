import { Router } from 'express';
import mongoose, { type QueryFilter } from 'mongoose';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { requireAuth } from '../middleware/auth';
import { CATEGORIES, Listing, UNITS, type IListing, type ListingDoc } from '../models/Listing';
import { User } from '../models/User';
import { matchAlerts } from '../services/alerts';
import { barangayCoords, distanceKm } from '../services/geo';
import { toListingDTO, toListingDTOs } from '../services/listingDto';

export const listingsRouter = Router();
listingsRouter.use(requireAuth);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function loadListing(id: string): Promise<ListingDoc> {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Listing not found');
  const l = await Listing.findById(id);
  if (!l) throw new HttpError(404, 'Listing not found');
  return l;
}

listingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    const and: QueryFilter<IListing>[] = [];
    if (q.mine === '1') {
      and.push({ sellerId: req.userId });
    } else {
      and.push({ status: 'active' });
      if (q.sellerId && mongoose.isValidObjectId(q.sellerId)) and.push({ sellerId: q.sellerId });
      const me = await User.findById(req.userId);
      if (me?.blocked.length) and.push({ sellerId: { $nin: me.blocked } });
    }
    if (q.category) and.push({ category: q.category as IListing['category'] });
    if (q.barangay) and.push({ barangay: q.barangay });
    if (q.preorder === '1') and.push({ preorder: true });
    if (q.delivery === '1') and.push({ delivery: true });
    if (q.minPrice) and.push({ price: { $gte: Number(q.minPrice) } });
    if (q.maxPrice) and.push({ price: { $lte: Number(q.maxPrice) } });
    if (q.q?.trim()) {
      const re = new RegExp(escapeRe(q.q.trim()), 'i');
      and.push({ $or: [{ title: re }, { description: re }] });
    }
    if (q.verifiedOnly === '1') {
      const ids = await User.find({ 'verification.status': 'verified' }).distinct('_id');
      and.push({ sellerId: { $in: ids } });
    }

    const sort = q.sort ?? 'newest';
    const dbSort: Record<string, 1 | -1> =
      sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };
    const docs = await Listing.find({ $and: and }).sort(dbSort).limit(200);
    let items = await toListingDTOs(docs, req.userId);

    if (sort === 'nearest' && q.lat && q.lng) {
      const here = { lat: Number(q.lat), lng: Number(q.lng) };
      items = items
        .map((i) => ({ i, d: distanceKm(here, i.coords) }))
        .sort((a, b) => a.d - b.d)
        .map(({ i, d }) => ({ ...i, distanceKm: Math.round(d * 10) / 10 }));
    } else if (sort === 'rating') {
      items = [...items].sort((a, b) => b.seller.ratingAvg - a.seller.ratingAvg);
    }
    res.json({ items });
  }),
);

const fields = {
  title: z.string().trim().min(3),
  description: z.string().default(''),
  category: z.enum(CATEGORIES),
  price: z.number().positive(),
  unit: z.enum(UNITS),
  stock: z.number().min(0),
  minOrder: z.number().min(1).default(1),
  harvestDate: z.string().optional(),
  preorder: z.boolean().default(false),
  negotiable: z.boolean().default(true),
  pickup: z.boolean().default(true),
  delivery: z.boolean().default(false),
  barangay: z.string().min(1),
  coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  photos: z.array(z.string()).max(5).default([]),
};
const createSchema = z.object(fields);
const patchSchema = z.object(fields).partial().extend({ status: z.enum(['active', 'paused', 'soldout']).optional() });

listingsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const me = await User.findById(req.userId);
    if (me?.role !== 'farmer') throw new HttpError(403, 'Switch to Farmer mode to sell');
    const b = createSchema.parse(req.body);
    const coords = b.coords ?? barangayCoords(b.barangay);
    if (!coords) throw new HttpError(400, 'Unknown barangay');
    const doc = await Listing.create({ ...b, coords, sellerId: me._id, stock: Math.max(1, b.stock) });
    matchAlerts(doc).catch((e) => console.error('matchAlerts failed', e));
    res.status(201).json({ listing: await toListingDTO(doc, req.userId) });
  }),
);

listingsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadListing(String(req.params.id));
    if (String(doc.sellerId) !== req.userId) {
      doc.views += 1;
      await Listing.updateOne({ _id: doc._id }, { $inc: { views: 1 } });
    }
    res.json({ listing: await toListingDTO(doc, req.userId) });
  }),
);

listingsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadListing(String(req.params.id));
    if (String(doc.sellerId) !== req.userId) throw new HttpError(403, 'Not your listing');
    const patch = patchSchema.parse(req.body);
    if (patch.barangay && !patch.coords) {
      const c = barangayCoords(patch.barangay);
      if (c) patch.coords = c;
    }
    doc.set(patch);
    await doc.save();
    res.json({ listing: await toListingDTO(doc, req.userId) });
  }),
);

listingsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadListing(String(req.params.id));
    if (String(doc.sellerId) !== req.userId) throw new HttpError(403, 'Not your listing');
    await doc.deleteOne();
    res.json({ ok: true });
  }),
);

listingsRouter.post(
  '/:id/favorite',
  asyncHandler(async (req, res) => {
    const doc = await loadListing(String(req.params.id));
    const has = doc.favoritedBy.some((f) => String(f) === req.userId);
    await Listing.updateOne({ _id: doc._id }, has ? { $pull: { favoritedBy: req.userId } } : { $addToSet: { favoritedBy: req.userId } });
    res.json({ favorited: !has });
  }),
);
