import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { notify } from '../src/services/notifications';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

const app = createApp();
beforeAll(setupDb);
beforeEach(resetDb);
afterAll(teardownDb);

const n = (title: string) => ({ type: 'message' as const, title, body: 'b', route: '/chat/1' });

describe('notifications', () => {
  it('persists, counts unread, and marks all read', async () => {
    const u = await makeUser(app);
    await notify(u.id, n('one'));
    await notify(u.id, n('two'));
    expect((await request(app).get('/api/notifications/unread-count').set(u.auth)).body.count).toBe(2);
    const list = await request(app).get('/api/notifications').set(u.auth);
    expect(list.body.items.map((i: { title: string }) => i.title)).toEqual(['two', 'one']);
    await request(app).post('/api/notifications/read').set(u.auth).send({});
    expect((await request(app).get('/api/notifications/unread-count').set(u.auth)).body.count).toBe(0);
  });

  it('marks only the given ids as read', async () => {
    const u = await makeUser(app);
    await notify(u.id, n('one'));
    await notify(u.id, n('two'));
    const items = (await request(app).get('/api/notifications').set(u.auth)).body.items;
    await request(app).post('/api/notifications/read').set(u.auth).send({ ids: [items[0].id] });
    expect((await request(app).get('/api/notifications/unread-count').set(u.auth)).body.count).toBe(1);
  });

  it('does not show one user another user\'s notifications', async () => {
    const a = await makeUser(app);
    const b = await makeUser(app);
    await notify(a.id, n('private'));
    expect((await request(app).get('/api/notifications').set(b.auth)).body.items).toHaveLength(0);
  });

  it('creates a notification for the recipient when a chat message is sent', async () => {
    const farmer = await makeUser(app, { role: 'farmer', name: 'Fe' });
    const buyer = await makeUser(app, { name: 'Ben' });
    const listing = await createListing(app, farmer.auth);
    const conv = (await request(app).post('/api/conversations').set(buyer.auth).send({ listingId: listing.id })).body.conversation;
    await request(app).post(`/api/conversations/${conv.id}/messages`).set(buyer.auth).send({ type: 'text', text: 'Kumusta' });
    await new Promise((r) => setTimeout(r, 200));
    const items = (await request(app).get('/api/notifications').set(farmer.auth)).body.items;
    expect(items[0]).toMatchObject({ type: 'message', title: 'Ben', body: 'Kumusta', route: `/chat/${conv.id}` });
  });
});
