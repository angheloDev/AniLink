import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Notification } from '../src/models/Notification';
import { User } from '../src/models/User';
import { makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

describe('verification facade', () => {
  it('goes pending, then auto-verifies after the delay and notifies', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const r = await request(app).post('/api/me/verification').set(farmer.auth).send({ idPhotoUrl: '/uploads/a.png', farmPhotoUrl: '/uploads/b.png' });
    expect(r.status).toBe(200);
    expect(r.body.user.verification.status).toBe('pending');
    const end = Date.now() + 3000;
    let status = 'pending';
    while (Date.now() < end && status !== 'verified') {
      await new Promise((res) => setTimeout(res, 50));
      status = (await User.findById(farmer.id))!.verification.status;
    }
    expect(status).toBe('verified');
    expect(await Notification.countDocuments({ userId: farmer.id, type: 'verification' })).toBe(1);
  });

  it('requires both photos', async () => {
    const farmer = await makeUser(app, { role: 'farmer' });
    const r = await request(app).post('/api/me/verification').set(farmer.auth).send({ idPhotoUrl: '/uploads/a.png' });
    expect(r.status).toBe(400);
  });
});
