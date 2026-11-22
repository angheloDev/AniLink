import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { io as connectClient, type Socket } from 'socket.io-client';
import { createApp } from '../src/app';
import { attachSockets } from '../src/sockets';
import { createListing, makeUser } from './factories';
import { resetDb, setupDb, teardownDb } from './helpers';

let server: http.Server;
let base = '';
const sockets: Socket[] = [];

const api = (token: string, method: string, path: string, body?: unknown) =>
  fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());

const connect = (token: string) =>
  new Promise<Socket>((resolve, reject) => {
    const s = connectClient(base, { auth: { token }, transports: ['websocket'] });
    sockets.push(s);
    s.on('connect', () => resolve(s));
    s.on('connect_error', reject);
  });

const once = <T>(s: Socket, event: string) => new Promise<T>((resolve) => s.once(event, resolve));

beforeAll(async () => {
  await setupDb();
  server = http.createServer(createApp());
  attachSockets(server);
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
beforeEach(resetDb);
afterAll(async () => {
  sockets.forEach((s) => s.close());
  await new Promise((r) => server.close(r));
  await teardownDb();
});

describe('sockets', () => {
  it('rejects a connection without a valid token', async () => {
    await expect(connect('garbage')).rejects.toBeTruthy();
  });

  it('delivers message:new to the other participant within a second', async () => {
    const app = createApp();
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const listing = await createListing(app, farmer.auth);
    const conv = (await api(buyer.token, 'POST', '/api/conversations', { listingId: listing.id })).conversation;
    const fs = await connect(farmer.token);
    const got = once<{ message: { text: string; conversationId: string } }>(fs, 'message:new');
    const t0 = Date.now();
    await api(buyer.token, 'POST', `/api/conversations/${conv.id}/messages`, { type: 'text', text: 'hello live' });
    const payload = await got;
    expect(payload.message.text).toBe('hello live');
    expect(payload.message.conversationId).toBe(conv.id);
    expect(Date.now() - t0).toBeLessThan(1000);
  });

  it('relays typing to the other participant and emits offer:update on respond', async () => {
    const app = createApp();
    const farmer = await makeUser(app, { role: 'farmer' });
    const buyer = await makeUser(app);
    const listing = await createListing(app, farmer.auth, { stock: 50 });
    const conv = (await api(buyer.token, 'POST', '/api/conversations', { listingId: listing.id })).conversation;
    const fs = await connect(farmer.token);
    const bs = await connect(buyer.token);
    fs.emit('conversation:join', conv.id);
    bs.emit('conversation:join', conv.id);
    await new Promise((r) => setTimeout(r, 150));
    const typing = once<{ userId: string; isTyping: boolean }>(fs, 'typing');
    bs.emit('typing', { conversationId: conv.id, isTyping: true });
    expect(await typing).toMatchObject({ userId: buyer.id, isTyping: true });

    const offer = (await api(buyer.token, 'POST', `/api/conversations/${conv.id}/offers`, { pricePerUnit: 70, quantity: 5, delivery: 'pickup', date: '2026-12-01' })).offer;
    const upd = once<{ offer: { status: string } }>(bs, 'offer:update');
    await api(farmer.token, 'POST', `/api/offers/${offer.id}/respond`, { action: 'decline' });
    expect((await upd).offer.status).toBe('declined');
  });
});
