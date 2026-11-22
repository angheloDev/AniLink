import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Report } from '../src/models/Report';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

describe('reports and blocking', () => {
  it('records a report', async () => {
    const a = await makeUser(app);
    const b = await makeUser(app, { role: 'farmer' });
    const r = await request(app).post('/api/reports').set(a.auth).send({ targetType: 'user', targetId: b.id, reason: 'Spam' });
    expect(r.status).toBe(201);
    expect(await Report.countDocuments({ targetId: b.id })).toBe(1);
  });

  it('cannot block yourself', async () => {
    const a = await makeUser(app);
    expect((await request(app).post(`/api/users/${a.id}/block`).set(a.auth)).status).toBe(400);
  });

  it('blocking hides the seller listings and stops their messages', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const listing = await createListing(app, farmer.auth);
    const conv = (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: listing.id })).body.conversation;
    expect((await request(app).get('/api/listings').set(buyer.auth)).body.items).toHaveLength(1);
    expect((await request(app).post(`/api/users/${farmer.id}/block`).set(buyer.auth)).body.blocked).toBe(true);
    expect((await request(app).get('/api/listings').set(buyer.auth)).body.items).toHaveLength(0);
    const msg = await request(app).post(`/api/conversations/${conv.id}/messages`).set(farmer.auth).send({ type: 'text', text: 'hello?' });
    expect(msg.status).toBe(403);
  });

  it('unblocking restores access', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    await createListing(app, farmer.auth);
    await request(app).post(`/api/users/${farmer.id}/block`).set(buyer.auth);
    await request(app).delete(`/api/users/${farmer.id}/block`).set(buyer.auth);
    expect((await request(app).get('/api/listings').set(buyer.auth)).body.items).toHaveLength(1);
  });

  it('stops a blocked pair from sending or answering offers in an existing conversation', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const listing = await createListing(app, farmer.auth, { stock: 50 });
    const conv = (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: listing.id })).body.conversation;
    const terms = { pricePerUnit: 70, quantity: 5, delivery: 'pickup', date: '2026-12-01' };
    const pending = (await request(app).post(`/api/conversations/${conv.id}/offers`).set(buyer.auth).send(terms)).body.offer;
    await request(app).post(`/api/users/${buyer.id}/block`).set(farmer.auth);
    expect((await request(app).post(`/api/conversations/${conv.id}/offers`).set(buyer.auth).send(terms)).status).toBe(403);
    expect((await request(app).post(`/api/offers/${pending.id}/respond`).set(farmer.auth).send({ action: 'accept' })).status).toBe(403);
  });
});
