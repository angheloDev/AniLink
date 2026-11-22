import type { ListingDTO, SellerSummary } from '../api/types';
import { distanceKm, type LatLng } from './geo';

const LIMIT = 8;

export interface HomeSections {
  fresh: ListingDTO[];
  nearYou: ListingDTO[];
  upcoming: ListingDTO[];
  verifiedSellers: SellerSummary[];
}

export function buildHomeSections(all: ListingDTO[], me: LatLng | null): HomeSections {
  const active = all.filter((l) => l.status === 'active');
  const time = (s: string) => new Date(s).getTime();

  const fresh = active
    .filter((l) => !l.preorder)
    .sort((a, b) => time(b.createdAt) - time(a.createdAt))
    .slice(0, LIMIT);

  const now = Date.now();
  const upcoming = active
    .filter((l) => l.preorder && l.harvestDate && time(l.harvestDate) > now)
    .sort((a, b) => time(a.harvestDate!) - time(b.harvestDate!))
    .slice(0, LIMIT);

  const nearYou = me
    ? active
        .map((l) => ({ l, d: distanceKm(me, l.coords) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, LIMIT)
        .map(({ l, d }) => ({ ...l, distanceKm: Math.round(d * 10) / 10 }))
    : [];

  const seen = new Map<string, SellerSummary>();
  for (const l of active) if (l.seller.verified && !seen.has(l.seller.id)) seen.set(l.seller.id, l.seller);
  const verifiedSellers = [...seen.values()].sort((a, b) => b.ratingAvg - a.ratingAvg).slice(0, LIMIT);

  return { fresh, nearYou, upcoming, verifiedSellers };
}
