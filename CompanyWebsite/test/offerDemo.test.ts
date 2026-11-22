import { describe, expect, it } from 'vitest';
import { initialOfferDemo, offerDemoReducer, type OfferDemoState } from '../src/lib/offerDemo';

const run = (...types: Array<'propose' | 'counter' | 'accept' | 'reset'>) =>
  types.reduce<OfferDemoState>((s, type) => offerDemoReducer(s, { type }), initialOfferDemo);

describe('offerDemoReducer', () => {
  it('propose from idle records the buyer offer: 120 x 10', () => {
    const s = run('propose');
    expect(s.stage).toBe('proposed');
    expect(s.history).toEqual([{ by: 'buyer', kind: 'offer', price: 120, qty: 10 }]);
  });

  it('counter then accept walk the story and keep the whole history in order', () => {
    const s = run('propose', 'counter', 'accept');
    expect(s.stage).toBe('accepted');
    expect(s.history).toEqual([
      { by: 'buyer', kind: 'offer', price: 120, qty: 10 },
      { by: 'farmer', kind: 'counter', price: 128, qty: 10 },
      { by: 'buyer', kind: 'accept', price: 128, qty: 10 },
    ]);
  });

  it('actions out of order return the very same state object', () => {
    expect(offerDemoReducer(initialOfferDemo, { type: 'accept' })).toBe(initialOfferDemo);
    expect(offerDemoReducer(initialOfferDemo, { type: 'counter' })).toBe(initialOfferDemo);
    const proposed = run('propose');
    expect(offerDemoReducer(proposed, { type: 'accept' })).toBe(proposed);
    const accepted = run('propose', 'counter', 'accept');
    expect(offerDemoReducer(accepted, { type: 'propose' })).toBe(accepted);
    expect(offerDemoReducer(accepted, { type: 'counter' })).toBe(accepted);
  });

  it('repeating an action does not duplicate history', () => {
    expect(run('propose', 'propose').history).toHaveLength(1);
    expect(run('propose', 'counter', 'counter').history).toHaveLength(2);
    expect(run('propose', 'counter', 'accept', 'accept').history).toHaveLength(3);
  });

  it('reset from every stage returns the initial state', () => {
    for (const steps of [[], ['propose'], ['propose', 'counter'], ['propose', 'counter', 'accept']] as const) {
      const s = offerDemoReducer(run(...steps), { type: 'reset' });
      expect(s).toBe(initialOfferDemo);
    }
  });
});
