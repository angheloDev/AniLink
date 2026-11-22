import { PriceGuide, type IPriceGuide } from '../models/PriceGuide';

export interface PriceBadge {
  avg: number;
  diff: number;
  diffPct: number;
  label: 'below' | 'above' | 'fair';
}

export function priceGuideBadge(price: number, avg: number): PriceBadge {
  const diff = Math.round((price - avg) * 100) / 100;
  const diffPct = avg > 0 ? (diff / avg) * 100 : 0;
  const label = Math.abs(diffPct) < 3 ? 'fair' : diff < 0 ? 'below' : 'above';
  return { avg, diff, diffPct: Math.round(diffPct * 10) / 10, label };
}

export function matchGuide(title: string, guides: IPriceGuide[]): IPriceGuide | undefined {
  const t = title.toLowerCase();
  return guides.find((g) => t.includes(g.crop.toLowerCase()));
}

export const loadGuides = () => PriceGuide.find().lean<IPriceGuide[]>();
