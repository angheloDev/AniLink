import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

async function scenario() {
  const farmer = await makeUser(app, { role: 'farmer', name: 'Farmer Fe' });
  const buyer = await makeUser(app, { role: 'buyer', name: 'Buyer Ben' });
  const listing = await createListing(app, farmer.auth, { stock: 100, minOrder: 5, price: 80 });
  const conv = (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: listing.id })).body.conversation;
  return { farmer, buyer, listing, conv };
}
const sendOffer = (auth: Record<string, string>, convId: string, over: Record<string, unknown> = {}) =>
  request(app).post(`/api/conversations/${convId}/offers`).set(auth).send({ pricePerUnit: 70, quantity: 10, delivery: 'pickup', date: '2026-12-01', ...over });
const respond = (auth: Record<string, string>, offerId: string, body: Record<string, unknown>) =>
  request(app).post(`/api/offers/${offerId}/respond`).set(auth).send(body);

describe('conversations', () => {
  it('returns the same conversation for the same listing and buyer', async () => {
    const { buyer, listing, conv } = await scenario();
    const again = await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: listing.id });
    expect(again.body.conversation.id).toBe(conv.id);
  });

  it('does not let a farmer message themselves about their own listing', async () => {
    const { farmer, listing } = await scenario();
    const r = await request(app).post('/api/conversations').set(farmer.auth).send({ listingId: listing.id });
    expect(r.status).toBe(400);
  });

  it('refuses to start a chat when either side has blocked the other', async () => {
    const { farmer, buyer, listing } = await scenario();
    const blocker = await makeUser(app);
    const clean = await makeUser(app);
    await User.updateOne({ _id: farmer.id }, { $push: { blocked: buyer.id } });
    await User.updateOne({ _id: blocker.id }, { $push: { blocked: farmer.id } });
    const start = (u: { auth: Record<string, string> }) => request(app).post('/api/conversations').set(u.auth).send({ listingId: listing.id });
    expect((await start(buyer)).status).toBe(403);
    expect((await start(blocker)).status).toBe(403);
    expect((await start(clean)).status).toBe(200);
  });

  it('forbids a non-participant from reading or posting messages', async () => {
    const { conv } = await scenario();
    const stranger = await makeUser(app);
    expect((await request(app).post(`/api/conversations/${conv.id}/messages`).set(stranger.auth).send({ type: 'text', text: 'hi' })).status).toBe(403);
    expect((await request(app).get(`/api/conversations/${conv.id}/messages`).set(stranger.auth)).status).toBe(403);
  });

  it('tracks last message and unread, and clears unread on read', async () => {
    const { farmer, buyer, conv } = await scenario();
    await request(app).post(`/api/conversations/${conv.id}/messages`).set(buyer.auth).send({ type: 'text', text: 'Available pa ba? ñandú 🍅' });
    const fList = await request(app).get('/api/conversations').set(farmer.auth);
    expect(fList.body.items[0].lastMessage).toContain('Available pa ba?');
    expect(fList.body.items[0].unread).toBe(1);
    const bList = await request(app).get('/api/conversations').set(buyer.auth);
    expect(bList.body.items[0].unread).toBe(0);
    await request(app).post(`/api/conversations/${conv.id}/read`).set(farmer.auth);
    expect((await request(app).get('/api/conversations').set(farmer.auth)).body.items[0].unread).toBe(0);
    const msgs = await request(app).get(`/api/conversations/${conv.id}/messages`).set(farmer.auth);
    expect(msgs.body.items[0].text).toBe('Available pa ba? ñandú 🍅');
    expect(msgs.body.items[0].readAt).toBeTruthy();
  });

  it('rejects an offer above stock with 422', async () => {
    const { buyer, conv } = await scenario();
    expect((await sendOffer(buyer.auth, conv.id, { quantity: 101 })).status).toBe(422);
  });

  it('lets the recipient accept, and blocks the sender and repeat responses', async () => {
    const { farmer, buyer, conv } = await scenario();
    const offer = (await sendOffer(buyer.auth, conv.id)).body.offer;
    expect((await respond(buyer.auth, offer.id, { action: 'accept' })).status).toBe(403);
    const ok = await respond(farmer.auth, offer.id, { action: 'accept' });
    expect(ok.status).toBe(200);
    expect(ok.body.offer.status).toBe('accepted');
    expect((await respond(farmer.auth, offer.id, { action: 'accept' })).status).toBe(409);
  });

  it('creates a counter-offer addressed back to the buyer and supersedes older pending offers', async () => {
    const { farmer, buyer, conv } = await scenario();
    const first = (await sendOffer(buyer.auth, conv.id)).body.offer;
    const second = (await sendOffer(buyer.auth, conv.id, { pricePerUnit: 72 })).body.offer;
    expect((await respond(farmer.auth, first.id, { action: 'decline' })).status).toBe(409);
    const c = await respond(farmer.auth, second.id, { action: 'counter', counter: { pricePerUnit: 78, quantity: 10, delivery: 'delivery', date: '2026-12-03' } });
    expect(c.body.offer.status).toBe('countered');
    expect(c.body.newOffer).toMatchObject({ status: 'pending', toUserId: buyer.id, fromUserId: farmer.id, pricePerUnit: 78 });
    const msgs = await request(app).get(`/api/conversations/${conv.id}/messages`).set(buyer.auth);
    const offers = msgs.body.items.filter((m: { type: string }) => m.type === 'offer');
    expect(offers).toHaveLength(3);
    expect(offers.map((m: { offer: { status: string } }) => m.offer.status).sort()).toEqual(['countered', 'pending', 'superseded']);
  });
});
