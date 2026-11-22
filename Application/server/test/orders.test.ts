import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Listing } from '../src/models/Listing';
import { Order } from '../src/models/Order';
import { User } from '../src/models/User';
import { nextStatuses } from '../src/services/orders';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

type Auth = { auth: Record<string, string>; id: string };

async function openConversation(buyer: Auth, listingId: string) {
  return (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId })).body.conversation.id as string;
}
async function offerAndAccept(farmer: Auth, buyer: Auth, convId: string, quantity: number, delivery: 'pickup' | 'delivery' = 'pickup') {
  const offer = (await request(app).post(`/api/conversations/${convId}/offers`).set(buyer.auth).send({ pricePerUnit: 80, quantity, delivery, date: '2026-12-01' })).body.offer;
  const res = await request(app).post(`/api/offers/${offer.id}/respond`).set(farmer.auth).send({ action: 'accept' });
  return { res, offerId: offer.id as string };
}
async function setup(opts: { stock?: number; quantity?: number; delivery?: 'pickup' | 'delivery' } = {}) {
  const farmer = await makeUser(app, { role: 'farmer' });
  const buyer = await makeUser(app);
  const listing = await createListing(app, farmer.auth, { stock: opts.stock ?? 20, price: 80 });
  const convId = await openConversation(buyer, listing.id);
  const { res } = await offerAndAccept(farmer, buyer, convId, opts.quantity ?? 5, opts.delivery);
  return { farmer, buyer, listing, convId, orderId: res.body.offer.orderId as string, res };
}
const pay = (a: Auth, id: string, method = 'ewallet_a') => request(app).post(`/api/orders/${id}/pay`).set(a.auth).send({ method });
const advance = (a: Auth, id: string, to: string) => request(app).post(`/api/orders/${id}/advance`).set(a.auth).send({ to });
const review = (a: Auth, id: string, rating: number) => request(app).post(`/api/orders/${id}/reviews`).set(a.auth).send({ rating, text: 'Sariwa!' });
async function complete(farmer: Auth, buyer: Auth, id: string) {
  await pay(buyer, id);
  await advance(farmer, id, 'preparing');
  await advance(farmer, id, 'ready_for_pickup');
  await advance(farmer, id, 'completed');
}

describe('nextStatuses', () => {
  it('follows the pickup and delivery paths', () => {
    expect(nextStatuses({ status: 'pending_payment', delivery: 'pickup' })).toEqual([]);
    expect(nextStatuses({ status: 'paid', delivery: 'pickup' })).toEqual(['preparing']);
    expect(nextStatuses({ status: 'preparing', delivery: 'pickup' })).toEqual(['ready_for_pickup']);
    expect(nextStatuses({ status: 'preparing', delivery: 'delivery' })).toEqual(['out_for_delivery']);
    expect(nextStatuses({ status: 'out_for_delivery', delivery: 'delivery' })).toEqual(['completed']);
    expect(nextStatuses({ status: 'completed', delivery: 'pickup' })).toEqual([]);
  });
});

describe('orders', () => {
  it('creates an order on accept, with total and decremented stock', async () => {
    const { buyer, listing, orderId } = await setup({ stock: 20, quantity: 5 });
    const o = await request(app).get(`/api/orders/${orderId}`).set(buyer.auth);
    expect(o.body.order).toMatchObject({ status: 'pending_payment', quantity: 5, pricePerUnit: 80, total: 400 });
    expect((await Listing.findById(listing.id))!.stock).toBe(15);
  });

  it('marks the listing soldout when the order takes the last stock', async () => {
    const { listing } = await setup({ stock: 5, quantity: 5 });
    const l = await Listing.findById(listing.id);
    expect(l!.stock).toBe(0);
    expect(l!.status).toBe('soldout');
  });

  it('lets exactly one of two concurrent accepts take the last stock', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const listing = await createListing(app, farmer.auth, { stock: 5, price: 80 });
    const buyerA = await makeUser(app);
    const buyerB = await makeUser(app);
    const offers = [] as string[];
    for (const b of [buyerA, buyerB]) {
      const convId = await openConversation(b, listing.id);
      offers.push((await request(app).post(`/api/conversations/${convId}/offers`).set(b.auth).send({ pricePerUnit: 80, quantity: 5, delivery: 'pickup', date: '2026-12-01' })).body.offer.id);
    }
    const results = await Promise.all(offers.map((id) => request(app).post(`/api/offers/${id}/respond`).set(farmer.auth).send({ action: 'accept' })));
    expect(results.map((r) => r.status).sort()).toEqual([200, 422]);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Listing.findById(listing.id))!.stock).toBe(0);
  });

  it('pays once, returning a reference, and rejects a second payment', async () => {
    const { buyer, orderId } = await setup();
    const p = await pay(buyer, orderId);
    expect(p.status).toBe(200);
    expect(p.body.order.status).toBe('paid');
    expect(p.body.order.paymentRef).toMatch(/^AL-[0-9A-F]{8}$/);
    expect((await pay(buyer, orderId)).status).toBe(409);
  });

  it('starts cash orders at preparing', async () => {
    const { buyer, orderId } = await setup();
    const p = await pay(buyer, orderId, 'cash');
    expect(p.body.order.status).toBe('preparing');
  });

  it('only the buyer pays and only the seller advances', async () => {
    const { farmer, buyer, orderId } = await setup();
    expect((await pay(farmer, orderId)).status).toBe(403);
    await pay(buyer, orderId);
    expect((await advance(buyer, orderId, 'preparing')).status).toBe(403);
  });

  it('rejects an illegal status jump with 409', async () => {
    const { farmer, buyer, orderId } = await setup();
    await pay(buyer, orderId);
    expect((await advance(farmer, orderId, 'completed')).status).toBe(409);
  });

  it('runs the delivery path through out_for_delivery', async () => {
    const { farmer, buyer, orderId } = await setup({ delivery: 'delivery' });
    await pay(buyer, orderId);
    await advance(farmer, orderId, 'preparing');
    expect((await advance(farmer, orderId, 'ready_for_pickup')).status).toBe(409);
    const out = await advance(farmer, orderId, 'out_for_delivery');
    expect(out.body.order.status).toBe('out_for_delivery');
    expect((await advance(farmer, orderId, 'completed')).body.order.status).toBe('completed');
  });

  it('restores stock when an order is cancelled', async () => {
    const { buyer, listing, orderId } = await setup({ stock: 5, quantity: 5 });
    const c = await request(app).post(`/api/orders/${orderId}/cancel`).set(buyer.auth);
    expect(c.body.order.status).toBe('cancelled');
    const l = await Listing.findById(listing.id);
    expect(l!.stock).toBe(5);
    expect(l!.status).toBe('active');
  });

  it('lists orders by role', async () => {
    const { farmer, buyer } = await setup();
    expect((await request(app).get('/api/orders?role=buying').set(buyer.auth)).body.items).toHaveLength(1);
    expect((await request(app).get('/api/orders?role=selling').set(buyer.auth)).body.items).toHaveLength(0);
    expect((await request(app).get('/api/orders?role=selling').set(farmer.auth)).body.items).toHaveLength(1);
  });
});

describe('reviews', () => {
  it('only allows a review after completion, once per order', async () => {
    const { farmer, buyer, orderId } = await setup();
    expect((await review(buyer, orderId, 5)).status).toBe(409);
    await complete(farmer, buyer, orderId);
    expect((await review(farmer, orderId, 5)).status).toBe(403);
    expect((await review(buyer, orderId, 5)).status).toBe(201);
    expect((await review(buyer, orderId, 4)).status).toBe(409);
  });

  it('averages seller ratings across orders', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const listing = await createListing(app, farmer.auth, { stock: 50, price: 80 });
    for (const rating of [5, 4]) {
      const buyer = await makeUser(app);
      const convId = await openConversation(buyer, listing.id);
      const { res } = await offerAndAccept(farmer, buyer, convId, 2);
      const id = res.body.offer.orderId as string;
      await complete(farmer, buyer, id);
      await review(buyer, id, rating);
    }
    const seller = await User.findById(farmer.id);
    expect(seller!.ratingAvg).toBe(4.5);
    expect(seller!.ratingCount).toBe(2);
  });

  it('exposes a public seller profile with reviews', async () => {
    const { farmer, buyer, orderId } = await setup();
    await complete(farmer, buyer, orderId);
    await review(buyer, orderId, 5);
    const p = await request(app).get(`/api/users/${farmer.id}`).set(buyer.auth);
    expect(p.status).toBe(200);
    expect(p.body.user.id).toBe(farmer.id);
    expect(p.body.reviews).toHaveLength(1);
    expect(p.body.reviews[0].rating).toBe(5);
  });
});

describe('payment races', () => {
  it('lets exactly one of two simultaneous payments succeed and records a single history entry', async () => {
    const { buyer, orderId } = await setup();
    const results = await Promise.all([pay(buyer, orderId), pay(buyer, orderId)]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const o = await Order.findById(orderId);
    expect(o!.history.filter((h) => h.status === 'paid')).toHaveLength(1);
  });

  it('never leaves a live order with its stock already returned when pay and cancel collide', async () => {
    for (let i = 0; i < 8; i++) {
      const { farmer, buyer, listing, orderId } = await setup({ stock: 10, quantity: 10 });
      await Promise.all([pay(buyer, orderId), request(app).post(`/api/orders/${orderId}/cancel`).set(farmer.auth)]);
      const o = await Order.findById(orderId);
      const l = await Listing.findById(listing.id);
      if (o!.status === 'cancelled') expect(l!.stock).toBe(10);
      else expect(l!.stock).toBe(0);
    }
  });
});
