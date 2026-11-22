import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { PriceGuide } from '../src/models/PriceGuide';
import { barangayCoords } from '../src/services/geo';
import { listingBody, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
const post = (auth: Record<string, string>, over: Record<string, unknown> = {}) => request(app).post('/api/listings').set(auth).send(listingBody(over));
const titles = (r: request.Response) => r.body.items.map((i: { title: string }) => i.title);

beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

describe('listings', () => {
  it('lets a buyer browse but not create (403)', async () => {
    const buyer = await makeUser(app, { role: 'buyer' });
    expect((await post(buyer.auth)).status).toBe(403);
  });

  it('creates a listing for a farmer and fills coords from the barangay', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const r = await post(farmer.auth);
    expect(r.status).toBe(201);
    const tumaga = barangayCoords('Tumaga')!;
    expect(r.body.listing.coords.lat).toBeCloseTo(tumaga.lat, 3);
    expect(r.body.listing.coords.lng).toBeCloseTo(tumaga.lng, 3);
    expect(r.body.listing.seller.id).toBe(farmer.id);
  });

  it('attaches a price-guide badge when a guide exists for the crop', async () => {
    await PriceGuide.create({ crop: 'Tomato', category: 'vegetables', unit: 'kg', low: 70, avg: 88, high: 110, trend: [80, 82, 84, 85, 86, 87, 88, 88] });
    const farmer = await makeUser(app, { role: 'farmer' });
    const r = await post(farmer.auth);
    expect(r.body.listing.priceGuide.label).toBe('below');
    expect(r.body.listing.priceGuide.diff).toBe(-6);
  });

  it('filters by category and verifiedOnly', async () => {
    const verified = await makeUser(app, { role: 'farmer', verified: true });
    const plain = await makeUser(app, { role: 'farmer' });
    await post(verified.auth, { title: 'Carabao Mangoes', category: 'fruits' });
    await post(plain.auth, { title: 'Lakatan Bananas', category: 'fruits' });
    await post(verified.auth, { title: 'Pechay', category: 'leafy' });
    const buyer = await makeUser(app);
    const fruits = await request(app).get('/api/listings?category=fruits').set(buyer.auth);
    expect(titles(fruits).sort()).toEqual(['Carabao Mangoes', 'Lakatan Bananas']);
    const v = await request(app).get('/api/listings?category=fruits&verifiedOnly=1').set(buyer.auth);
    expect(titles(v)).toEqual(['Carabao Mangoes']);
  });

  it('sorts by price ascending', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    await post(farmer.auth, { title: 'B item', price: 50 });
    await post(farmer.auth, { title: 'A item', price: 20 });
    await post(farmer.auth, { title: 'C item', price: 90 });
    const r = await request(app).get('/api/listings?sort=price_asc').set(farmer.auth);
    expect(r.body.items.map((i: { price: number }) => i.price)).toEqual([20, 50, 90]);
  });

  it('sorts nearest first when lat/lng are given', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    await post(farmer.auth, { title: 'Far', barangay: 'Labuan' });
    await post(farmer.auth, { title: 'Near', barangay: 'Tumaga' });
    const r = await request(app).get('/api/listings?sort=nearest&lat=6.9455&lng=122.0915').set(farmer.auth);
    expect(titles(r)).toEqual(['Near', 'Far']);
  });

  it('toggles a favorite on and off', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const id = (await post(farmer.auth)).body.listing.id;
    expect((await request(app).post(`/api/listings/${id}/favorite`).set(buyer.auth)).body.favorited).toBe(true);
    const favs = await request(app).get('/api/me/favorites').set(buyer.auth);
    expect(favs.body.items).toHaveLength(1);
    expect((await request(app).post(`/api/listings/${id}/favorite`).set(buyer.auth)).body.favorited).toBe(false);
  });

  it('forbids editing or deleting a listing you do not own', async () => {
    const owner = await makeUser(app, { role: 'farmer' });
    const other = await makeUser(app, { role: 'farmer' });
    const id = (await post(owner.auth)).body.listing.id;
    expect((await request(app).patch(`/api/listings/${id}`).set(other.auth).send({ price: 1 })).status).toBe(403);
    expect((await request(app).delete(`/api/listings/${id}`).set(other.auth)).status).toBe(403);
    expect((await request(app).patch(`/api/listings/${id}`).set(owner.auth).send({ price: 99 })).body.listing.price).toBe(99);
  });

  it('hides paused listings from browsing but shows them under mine=1', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const id = (await post(farmer.auth)).body.listing.id;
    await request(app).patch(`/api/listings/${id}`).set(farmer.auth).send({ status: 'paused' });
    expect((await request(app).get('/api/listings').set(farmer.auth)).body.items).toHaveLength(0);
    expect((await request(app).get('/api/listings?mine=1').set(farmer.auth)).body.items).toHaveLength(1);
  });
});
