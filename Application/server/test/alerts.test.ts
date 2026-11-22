import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Notification } from '../src/models/Notification';
import { matchAlert } from '../src/services/alerts';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const listing = { title: 'Carabao Mangoes', price: 145, barangay: 'Tumaga' };

describe('matchAlert', () => {
  it('matches the crop name case-insensitively and respects maxPrice inclusively', () => {
    expect(matchAlert({ crop: 'mango', maxPrice: 150 }, listing)).toBe(true);
    expect(matchAlert({ crop: 'MANGO', maxPrice: 145 }, listing)).toBe(true);
    expect(matchAlert({ crop: 'mango', maxPrice: 144 }, listing)).toBe(false);
    expect(matchAlert({ crop: 'banana' }, listing)).toBe(false);
  });
  it('requires the barangay to match when one is set', () => {
    expect(matchAlert({ crop: 'mango', barangay: 'tumaga' }, listing)).toBe(true);
    expect(matchAlert({ crop: 'mango', barangay: 'Ayala' }, listing)).toBe(false);
  });
});

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

const waitFor = async (fn: () => Promise<boolean>, ms = 3000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
};

describe('alerts api', () => {
  it('notifies a subscribed buyer when a matching listing is posted, but not for a non-match', async () => {
    const buyer = await makeUser(app);
    const farmer = await makeUser(app, { role: 'farmer' });
    const created = await request(app).post('/api/alerts').set(buyer.auth).send({ crop: 'mango', maxPrice: 150 });
    expect(created.status).toBe(201);
    await createListing(app, farmer.auth, { title: 'Pechay', price: 20 });
    await createListing(app, farmer.auth, { title: 'Carabao Mangoes', price: 145, category: 'fruits' });
    expect(await waitFor(async () => (await Notification.countDocuments({ userId: buyer.id, type: 'alert' })) === 1)).toBe(true);
    await new Promise((r) => setTimeout(r, 200));
    expect(await Notification.countDocuments({ userId: buyer.id, type: 'alert' })).toBe(1);
  });

  it('lists and deletes only your own alerts', async () => {
    const a = await makeUser(app);
    const b = await makeUser(app);
    const id = (await request(app).post('/api/alerts').set(a.auth).send({ crop: 'tomato' })).body.alert.id;
    expect((await request(app).get('/api/alerts').set(a.auth)).body.items).toHaveLength(1);
    expect((await request(app).get('/api/alerts').set(b.auth)).body.items).toHaveLength(0);
    expect((await request(app).delete(`/api/alerts/${id}`).set(b.auth)).status).toBe(404);
    expect((await request(app).delete(`/api/alerts/${id}`).set(a.auth)).status).toBe(200);
  });
});
