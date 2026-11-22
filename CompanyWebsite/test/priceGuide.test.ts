import { describe, expect, it } from 'vitest';
import { PRICE_GUIDE, sparklinePath, vsAverage } from '../src/lib/priceGuide';

describe('sparklinePath', () => {
  it('scales values into the box: min at the bottom, max at the top', () => {
    expect(sparklinePath([1, 2, 3], 100, 50)).toBe('M0,50 L50,25 L100,0');
  });
  it('returns an empty path for no data', () => {
    expect(sparklinePath([], 100, 50)).toBe('');
  });
  it('draws a flat line for one value, with no NaN', () => {
    const d = sparklinePath([5], 100, 50);
    expect(d.startsWith('M')).toBe(true);
    expect(d).not.toContain('NaN');
  });
  it('draws a flat line when every value is equal (no divide by zero)', () => {
    const d = sparklinePath([4, 4, 4], 100, 50);
    expect(d).not.toContain('NaN');
    expect(d).toBe('M0,25 L50,25 L100,25');
  });
});

describe('vsAverage', () => {
  it('reports how far a price is from the average', () => {
    expect(vsAverage(76, 82)).toEqual({ delta: 6, label: 'below' });
    expect(vsAverage(90, 82)).toEqual({ delta: 8, label: 'above' });
    expect(vsAverage(82, 82)).toEqual({ delta: 0, label: 'at' });
  });
});

describe('PRICE_GUIDE sample data', () => {
  it('has well-formed entries with 8 weekly values', () => {
    expect(PRICE_GUIDE.length).toBeGreaterThanOrEqual(4);
    for (const c of PRICE_GUIDE) {
      expect(c.weekly).toHaveLength(8);
      expect(c.low).toBeLessThanOrEqual(c.avg);
      expect(c.avg).toBeLessThanOrEqual(c.high);
    }
  });
  it('leads with mango, listed ₱6 below its average (the spec example)', () => {
    const mango = PRICE_GUIDE[0];
    expect(mango.crop).toBe('Mango');
    expect(vsAverage(mango.listed, mango.avg)).toEqual({ delta: 6, label: 'below' });
  });
});
