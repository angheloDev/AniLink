import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Conversation } from '../src/models/Chat';
import { CATEGORIES, Listing, UNITS } from '../src/models/Listing';
import { PriceGuide } from '../src/models/PriceGuide';
import { User } from '../src/models/User';
import { BARANGAYS } from '../src/services/geo';
import { seed } from '../src/seed/seed';
import { setupDb, teardownDb } from './helpers';

const app = createApp();
let result: { users: number; listings: number };

beforeAll(async () => {
  await setupDb();
  result = await seed();
});
afterAll(teardownDb);

describe('seed', () => {
  it('creates enough users and listings', () => {
    expect(result.listings).toBeGreaterThanOrEqual(35);
    expect(result.users).toBeGreaterThanOrEqual(11);
  });

  it('covers every category and every unit', async () => {
    for (const c of CATEGORIES) expect(await Listing.countDocuments({ category: c }), c).toBeGreaterThan(0);
    for (const u of UNITS) expect(await Listing.countDocuments({ unit: u }), u).toBeGreaterThan(0);
  });

  it('puts every listing in a known barangay with matching coords', async () => {
    const names = new Set(BARANGAYS.map((b) => b.name));
    for (const l of await Listing.find()) {
      expect(names.has(l.barangay), l.barangay).toBe(true);
      const b = BARANGAYS.find((x) => x.name === l.barangay)!;
      expect(l.coords.lat).toBeCloseTo(b.lat, 4);
    }
  });

  it('has price guides with 8-point trends for at least 12 crops', async () => {
    const guides = await PriceGuide.find();
    expect(guides.length).toBeGreaterThanOrEqual(12);
    for (const g of guides) {
      expect(g.trend).toHaveLength(8);
      expect(g.low).toBeLessThanOrEqual(g.avg);
      expect(g.avg).toBeLessThanOrEqual(g.high);
    }
  });

  it('lets both demo accounts log in', async () => {
    const f = await request(app).post('/api/auth/login').send({ email: 'farmer@anilink.demo', password: 'anilink123' });
    const b = await request(app).post('/api/auth/login').send({ email: 'buyer@anilink.demo', password: 'anilink123' });
    expect(f.status).toBe(200);
    expect(f.body.user.role).toBe('farmer');
    expect(f.body.user.onboarded).toBe(true);
    expect(b.status).toBe(200);
    expect(b.body.user.role).toBe('buyer');
  });

  it('has at least three verified farmers, rated sellers, upcoming harvests and a demo conversation', async () => {
    expect(await User.countDocuments({ role: 'farmer', 'verification.status': 'verified' })).toBeGreaterThanOrEqual(3);
    expect(await User.countDocuments({ ratingCount: { $gt: 0 } })).toBeGreaterThanOrEqual(3);
    expect(await Listing.countDocuments({ preorder: true, harvestDate: { $gt: new Date() } })).toBeGreaterThanOrEqual(3);
    const buyer = (await User.findOne({ email: 'buyer@anilink.demo' }))!;
    expect(await Conversation.countDocuments({ buyerId: buyer._id })).toBeGreaterThanOrEqual(1);
  });
});
