import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
const reg = (over: Record<string, unknown> = {}) =>
  request(app).post('/api/auth/register').send({ name: 'Maria', email: 'maria@x.com', password: 'secret12', role: 'buyer', ...over });

beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

describe('auth', () => {
  it('registers then logs in with the same credentials', async () => {
    const r = await reg();
    expect(r.status).toBe(201);
    expect(r.body.token).toBeTruthy();
    expect(r.body.user.email).toBe('maria@x.com');
    expect(r.body.user.passwordHash).toBeUndefined();
    const l = await request(app).post('/api/auth/login').send({ email: 'maria@x.com', password: 'secret12' });
    expect(l.status).toBe(200);
    expect(l.body.user.id).toBe(r.body.user.id);
  });

  it('rejects a duplicate email that differs only by case', async () => {
    await reg({ email: 'a@x.com' });
    const dup = await reg({ email: 'A@X.com' });
    expect(dup.status).toBe(409);
    const login = await request(app).post('/api/auth/login').send({ email: 'A@X.COM', password: 'secret12' });
    expect(login.status).toBe(200);
  });

  it('rejects a wrong password with 401', async () => {
    await reg();
    const l = await request(app).post('/api/auth/login').send({ email: 'maria@x.com', password: 'nope-nope' });
    expect(l.status).toBe(401);
  });

  it('requires a token for /api/me', async () => {
    const r = await request(app).get('/api/me');
    expect(r.status).toBe(401);
  });

  it('google-demo returns the same user for the same email', async () => {
    const a = await request(app).post('/api/auth/google-demo').send({ email: 'g@gmail.com', name: 'Gina' });
    const b = await request(app).post('/api/auth/google-demo').send({ email: 'G@gmail.com', name: 'Gina' });
    expect(a.status).toBe(200);
    expect(a.body.user.onboarded).toBe(false);
    expect(b.body.user.id).toBe(a.body.user.id);
  });

  it('PATCH /api/me persists a role switch', async () => {
    const r = await reg();
    const p = await request(app).patch('/api/me').set('Authorization', `Bearer ${r.body.token}`).send({ role: 'farmer', onboarded: true });
    expect(p.status).toBe(200);
    const me = await request(app).get('/api/me').set('Authorization', `Bearer ${r.body.token}`);
    expect(me.body.user.role).toBe('farmer');
    expect(me.body.user.onboarded).toBe(true);
  });

  it('rejects an OTP verify with a wrong code', async () => {
    const q = await request(app).post('/api/auth/otp/request').send({ phone: '09171234567' });
    expect(q.body.code).toMatch(/^\d{6}$/);
    const bad = await request(app).post('/api/auth/otp/verify').send({ phone: '09171234567', code: '000000' === q.body.code ? '111111' : '000000' });
    expect(bad.status).toBe(400);
    const good = await request(app).post('/api/auth/otp/verify').send({ phone: '09171234567', code: q.body.code });
    expect(good.body.ok).toBe(true);
  });

  it('resets a password with the forgot code', async () => {
    await reg();
    const f = await request(app).post('/api/auth/forgot').send({ email: 'maria@x.com' });
    const r = await request(app).post('/api/auth/reset').send({ email: 'maria@x.com', code: f.body.code, password: 'newpass12' });
    expect(r.body.ok).toBe(true);
    const l = await request(app).post('/api/auth/login').send({ email: 'maria@x.com', password: 'newpass12' });
    expect(l.status).toBe(200);
  });
});
