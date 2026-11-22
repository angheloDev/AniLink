import { describe, expect, it } from 'vitest';
import { distanceKm } from '../src/services/geo';
import { priceGuideBadge } from '../src/services/priceGuide';

describe('priceGuideBadge', () => {
  it('labels a cheaper price as below with a negative diff', () => {
    const b = priceGuideBadge(82, 88);
    expect(b.label).toBe('below');
    expect(b.diff).toBe(-6);
  });
  it('labels an equal price as fair', () => {
    expect(priceGuideBadge(88, 88).label).toBe('fair');
  });
  it('labels a dearer price as above', () => {
    expect(priceGuideBadge(95, 88).label).toBe('above');
  });
});

describe('distanceKm', () => {
  it('measures one degree of latitude as about 111 km', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 0);
  });
});
