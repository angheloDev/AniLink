import request from 'supertest';
import type { Express } from 'express';
import { User } from '../src/models/User';

let counter = 0;

export async function makeUser(
  app: Express,
  opts: { role?: 'farmer' | 'buyer'; email?: string; verified?: boolean; name?: string } = {},
): Promise<{ token: string; id: string; auth: { Authorization: string } }> {
  counter += 1;
  const email = opts.email ?? `user${counter}-${Date.now()}@test.com`;
  const r = await request(app)
    .post('/api/auth/register')
    .send({ name: opts.name ?? `User ${counter}`, email, password: 'secret12', role: opts.role ?? 'buyer' });
  const id = r.body.user.id as string;
  await User.updateOne({ _id: id }, { onboarded: true, ...(opts.verified ? { 'verification.status': 'verified' } : {}) });
  return { token: r.body.token, id, auth: { Authorization: `Bearer ${r.body.token}` } };
}

export const listingBody = (over: Record<string, unknown> = {}) => ({
  title: 'Baguio Tomatoes',
  description: 'Fresh',
  category: 'vegetables',
  price: 82,
  unit: 'kg',
  stock: 100,
  minOrder: 1,
  barangay: 'Tumaga',
  photos: [],
  ...over,
});

export async function createListing(app: Express, auth: Record<string, string>, over: Record<string, unknown> = {}) {
  const r = await request(app).post('/api/listings').set(auth).send(listingBody(over));
  return r.body.listing as { id: string; stock: number; price: number; title: string };
}
