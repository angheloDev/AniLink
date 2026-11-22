import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Listing } from '../src/models/Listing';
import { Order } from '../src/models/Order';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

describe('GET /api/me/dashboard', () => {
  it('summarises a farmer: listings, views, pending offers and recent offers', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app, { name: 'Buyer Ben' });
    const l1 = await createListing(app, farmer.auth, { title: 'Tomatoes', stock: 50, price: 80 });
    await createListing(app, farmer.auth, { title: 'Eggplant', stock: 20, price: 60 });
    await Listing.updateOne({ _id: l1.id }, { views: 12 });
    const conv = (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: l1.id })).body.conversation;
    await request(app).post(`/api/conversations/${conv.id}/offers`).set(buyer.auth).send({ pricePerUnit: 70, quantity: 10, delivery: 'pickup', date: '2026-12-01' });

    const d = await request(app).get('/api/me/dashboard').set(farmer.auth);
    expect(d.status).toBe(200);
    expect(d.body.activeListings).toBe(2);
    expect(d.body.views).toBe(12);
    expect(d.body.pendingOffers).toBe(1);
    expect(d.body.recentOffers).toHaveLength(1);
    expect(d.body.recentOffers[0]).toMatchObject({ listingTitle: 'Tomatoes', buyerName: 'Buyer Ben', pricePerUnit: 70, quantity: 10, conversationId: conv.id });
  });

  it('counts open orders and this month\'s completed earnings, ignoring older months', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const l = await createListing(app, farmer.auth);
    const base = { listingId: l.id, buyerId: buyer.id, sellerId: farmer.id, title: 'Tomatoes', unit: 'kg', quantity: 5, pricePerUnit: 80, delivery: 'pickup' as const, date: '2026-12-01' };
    await Order.create({ ...base, total: 400, status: 'completed' });
    await Order.create({ ...base, total: 250, status: 'completed' });
    const old = await Order.create({ ...base, total: 9999, status: 'completed' });
    await Order.collection.updateOne({ _id: old._id }, { $set: { updatedAt: new Date(Date.now() - 90 * 86400000) } });
    await Order.create({ ...base, total: 100, status: 'preparing' });
    await Order.create({ ...base, total: 100, status: 'cancelled' });

    const d = await request(app).get('/api/me/dashboard').set(farmer.auth);
    expect(d.body.earningsThisMonth).toBe(650);
    expect(d.body.openOrders).toBe(1);
  });

  it('returns zeros for a user with no activity', async () => {
    const buyer = await makeUser(app);
    const d = await request(app).get('/api/me/dashboard').set(buyer.auth);
    expect(d.body).toMatchObject({ activeListings: 0, views: 0, pendingOffers: 0, openOrders: 0, earningsThisMonth: 0, recentOffers: [] });
  });
});
