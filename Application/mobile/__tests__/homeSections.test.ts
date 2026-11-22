import type { ListingDTO } from '../src/api/types';
import { distanceKm } from '../src/lib/geo';
import { buildHomeSections } from '../src/lib/homeSections';

const DAY = 86400000;
let n = 0;
function listing(over: Partial<ListingDTO> & { sellerOver?: Partial<ListingDTO['seller']> } = {}): ListingDTO {
  n += 1;
  const { sellerOver, ...rest } = over;
  return {
    id: `l${n}`,
    title: `Item ${n}`,
    description: '',
    category: 'vegetables',
    price: 50,
    unit: 'kg',
    stock: 10,
    minOrder: 1,
    harvestDate: null,
    preorder: false,
    negotiable: true,
    pickup: true,
    delivery: false,
    barangay: 'Tumaga',
    coords: { lat: 6.9455, lng: 122.0915 },
    photos: [],
    status: 'active',
    views: 0,
    favorited: false,
    favoritesCount: 0,
    createdAt: new Date(Date.now() - n * DAY).toISOString(),
    seller: { id: `s${n}`, name: `Seller ${n}`, photoUrl: null, verified: false, ratingAvg: 0, ratingCount: 0, barangay: null, ...sellerOver },
    priceGuide: null,
    ...rest,
  };
}

describe('distanceKm', () => {
  it('is zero for the same point and about 111 km per degree of latitude', () => {
    expect(distanceKm({ lat: 6.9, lng: 122 }, { lat: 6.9, lng: 122 })).toBe(0);
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 0);
  });
});

describe('buildHomeSections', () => {
  it('puts the newest non-preorder listings in "fresh", newest first, capped at 8', () => {
    const items = Array.from({ length: 10 }, () => listing());
    const pre = listing({ preorder: true, harvestDate: new Date(Date.now() + 3 * DAY).toISOString() });
    const s = buildHomeSections([...items, pre], null);
    expect(s.fresh).toHaveLength(8);
    expect(s.fresh.every((l) => !l.preorder)).toBe(true);
    const times = s.fresh.map((l) => new Date(l.createdAt).getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it('lists only future pre-orders in "upcoming", soonest harvest first', () => {
    const later = listing({ preorder: true, harvestDate: new Date(Date.now() + 10 * DAY).toISOString() });
    const soon = listing({ preorder: true, harvestDate: new Date(Date.now() + 2 * DAY).toISOString() });
    const past = listing({ preorder: true, harvestDate: new Date(Date.now() - 2 * DAY).toISOString() });
    const s = buildHomeSections([later, past, soon, listing()], null);
    expect(s.upcoming.map((l) => l.id)).toEqual([soon.id, later.id]);
  });

  it('orders "nearYou" by distance from the user and is empty without a location', () => {
    const near = listing({ coords: { lat: 6.9455, lng: 122.0915 } });
    const far = listing({ coords: { lat: 7.0150, lng: 121.9820 } });
    expect(buildHomeSections([far, near], { lat: 6.9455, lng: 122.0915 }).nearYou.map((l) => l.id)).toEqual([near.id, far.id]);
    expect(buildHomeSections([far, near], null).nearYou).toEqual([]);
  });

  it('collects each verified seller once, best rated first', () => {
    const a1 = listing({ seller: { id: 'A', name: 'A', photoUrl: null, verified: true, ratingAvg: 4.2, ratingCount: 5, barangay: null } });
    const a2 = listing({ seller: { id: 'A', name: 'A', photoUrl: null, verified: true, ratingAvg: 4.2, ratingCount: 5, barangay: null } });
    const b = listing({ seller: { id: 'B', name: 'B', photoUrl: null, verified: true, ratingAvg: 4.9, ratingCount: 9, barangay: null } });
    const c = listing({ seller: { id: 'C', name: 'C', photoUrl: null, verified: false, ratingAvg: 5, ratingCount: 1, barangay: null } });
    const s = buildHomeSections([a1, a2, b, c], null);
    expect(s.verifiedSellers.map((x) => x.id)).toEqual(['B', 'A']);
  });

  it('ignores paused and sold-out listings everywhere', () => {
    const ok = listing();
    const paused = listing({ status: 'paused' });
    const sold = listing({ status: 'soldout' });
    const s = buildHomeSections([ok, paused, sold], { lat: 6.9, lng: 122 });
    expect(s.fresh.map((l) => l.id)).toEqual([ok.id]);
    expect(s.nearYou.map((l) => l.id)).toEqual([ok.id]);
  });
});
