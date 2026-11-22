import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { makeUser } from './factories';
import { setupDb, teardownDb } from './helpers';

const app = createApp();
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

beforeAll(setupDb);
afterAll(teardownDb);

describe('uploads', () => {
  it('stores an image and serves it back', async () => {
    const u = await makeUser(app);
    const r = await request(app).post('/api/uploads').set(u.auth).attach('files', PNG, { filename: 'a.png', contentType: 'image/png' });
    expect(r.status).toBe(200);
    expect(r.body.urls[0]).toMatch(/^\/uploads\/.+\.png$/);
    const get = await request(app).get(r.body.urls[0]);
    expect(get.status).toBe(200);
  });
  it('rejects a non-image with 400', async () => {
    const u = await makeUser(app);
    const r = await request(app).post('/api/uploads').set(u.auth).attach('files', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' });
    expect(r.status).toBe(400);
  });
  it('requires authentication', async () => {
    const r = await request(app).post('/api/uploads').attach('files', PNG, { filename: 'a.png', contentType: 'image/png' });
    expect(r.status).toBe(401);
  });
});
