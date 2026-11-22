import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/http';
import { applyOfferAction, validateOfferAgainstListing, type OfferState } from '../src/services/offers';

const base: OfferState = {
  fromUserId: 'buyer1',
  toUserId: 'farmer1',
  pricePerUnit: 80,
  quantity: 10,
  delivery: 'pickup',
  date: '2026-12-01',
  status: 'pending',
};

const statusOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as HttpError).status;
  }
  return 0;
};

describe('applyOfferAction', () => {
  it('rejects an action by someone other than the recipient (403)', () => {
    expect(statusOf(() => applyOfferAction(base, 'buyer1', 'accept'))).toBe(403);
    expect(statusOf(() => applyOfferAction(base, 'stranger', 'decline'))).toBe(403);
  });

  it('rejects acting on an offer that is no longer pending (409)', () => {
    const accepted = applyOfferAction(base, 'farmer1', 'accept').offer;
    expect(accepted.status).toBe('accepted');
    expect(statusOf(() => applyOfferAction(accepted, 'farmer1', 'accept'))).toBe(409);
    expect(statusOf(() => applyOfferAction({ ...base, status: 'superseded' }, 'farmer1', 'accept'))).toBe(409);
  });

  it('declines a pending offer', () => {
    expect(applyOfferAction(base, 'farmer1', 'decline').offer.status).toBe('declined');
  });

  it('counter marks the original countered and creates a pending offer back to the sender', () => {
    const r = applyOfferAction(base, 'farmer1', 'counter', { pricePerUnit: 90, quantity: 10, delivery: 'delivery', date: '2026-12-02' });
    expect(r.offer.status).toBe('countered');
    expect(r.newOffer).toMatchObject({ status: 'pending', fromUserId: 'farmer1', toUserId: 'buyer1', pricePerUnit: 90, delivery: 'delivery' });
  });

  it('requires terms for a counter (400)', () => {
    expect(statusOf(() => applyOfferAction(base, 'farmer1', 'counter'))).toBe(400);
  });
});

describe('validateOfferAgainstListing', () => {
  const listing = { stock: 100, minOrder: 5, negotiable: true, price: 82 };
  it('accepts a valid offer', () => {
    expect(() => validateOfferAgainstListing({ quantity: 10, pricePerUnit: 70 }, listing)).not.toThrow();
  });
  it('rejects quantity above stock (422)', () => {
    expect(statusOf(() => validateOfferAgainstListing({ quantity: 101, pricePerUnit: 80 }, listing))).toBe(422);
  });
  it('rejects quantity below the minimum order (422)', () => {
    expect(statusOf(() => validateOfferAgainstListing({ quantity: 2, pricePerUnit: 80 }, listing))).toBe(422);
  });
  it('rejects a different price on a non-negotiable listing (422)', () => {
    expect(statusOf(() => validateOfferAgainstListing({ quantity: 10, pricePerUnit: 70 }, { ...listing, negotiable: false }))).toBe(422);
    expect(() => validateOfferAgainstListing({ quantity: 10, pricePerUnit: 82 }, { ...listing, negotiable: false })).not.toThrow();
  });
  it('rejects a zero or negative price or quantity (422)', () => {
    expect(statusOf(() => validateOfferAgainstListing({ quantity: 0, pricePerUnit: 80 }, listing))).toBe(422);
    expect(statusOf(() => validateOfferAgainstListing({ quantity: 10, pricePerUnit: 0 }, listing))).toBe(422);
  });
});
