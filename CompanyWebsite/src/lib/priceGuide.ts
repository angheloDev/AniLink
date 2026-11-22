/** SAMPLE reference prices (₱ per kg) for the Price Guide demo. Illustrative, not real market data. */
export interface CropPrice {
  crop: string;
  emoji: string;
  low: number;
  avg: number;
  high: number;
  /** Price of the sample listing compared against the average. */
  listed: number;
  /** Eight weekly averages, oldest first. */
  weekly: number[];
}

export const PRICE_GUIDE: CropPrice[] = [
  { crop: 'Mango', emoji: '🥭', low: 118, avg: 136, high: 158, listed: 130, weekly: [128, 130, 134, 138, 142, 140, 137, 136] },
  { crop: 'Tomato', emoji: '🍅', low: 60, avg: 78, high: 96, listed: 82, weekly: [70, 68, 72, 75, 80, 84, 80, 78] },
  { crop: 'Banana', emoji: '🍌', low: 52, avg: 64, high: 78, listed: 62, weekly: [60, 62, 63, 66, 67, 65, 64, 64] },
  { crop: 'Pechay', emoji: '🥬', low: 35, avg: 48, high: 62, listed: 55, weekly: [44, 46, 50, 52, 49, 47, 48, 48] },
  { crop: 'Kamote', emoji: '🍠', low: 38, avg: 46, high: 58, listed: 46, weekly: [44, 45, 47, 48, 46, 45, 46, 46] },
];

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** SVG path for a sparkline that fills a w×h box (min at the bottom, max at the top). */
export function sparklinePath(values: number[], w: number, h: number): string {
  const n = values.length;
  if (n === 0) return '';
  if (n === 1) return `M0,${fmt(h / 2)} L${fmt(w)},${fmt(h / 2)}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  return values
    .map((v, i) => {
      const x = (i * w) / (n - 1);
      const y = range === 0 ? h / 2 : h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${fmt(x)},${fmt(y)}`;
    })
    .join(' ');
}

/** How a price compares with the average: by how much, and on which side. */
export function vsAverage(price: number, avg: number): { delta: number; label: 'below' | 'above' | 'at' } {
  const delta = Math.abs(avg - price);
  return { delta, label: price < avg ? 'below' : price > avg ? 'above' : 'at' };
}
