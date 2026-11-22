/** Illustrative map data. Coordinates are real barangay centroids (from the app's barangay list), drawn on a stylised canvas. */
export const VIEWBOX = { w: 300, h: 260 } as const;

const LAT = { min: 6.9042, max: 7.0242 };
const LNG = { min: 121.9296, max: 122.1889 };

/** Linear projection of a lat/lng into the SVG viewBox (with margins). */
export function project(lat: number, lng: number): [number, number] {
  const x = 30 + ((lng - LNG.min) / (LNG.max - LNG.min)) * 240;
  const y = 40 + ((LAT.max - lat) / (LAT.max - LAT.min)) * 170;
  return [x, y];
}

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Sample ₱ price shown on the pin. */
  price: number;
  role?: 'farm' | 'buyer';
}

export const MAP_PINS: MapPin[] = [
  { id: 'talisayan', name: 'Talisayan', lat: 6.9885, lng: 121.9296, price: 62 },
  { id: 'ayala', name: 'Ayala', lat: 6.9601, lng: 121.9495, price: 55 },
  { id: 'mercedes', name: 'Mercedes', lat: 6.9576, lng: 122.1444, price: 130, role: 'farm' },
  { id: 'manicahan', name: 'Manicahan', lat: 7.0242, lng: 122.1889, price: 70 },
  { id: 'tumaga', name: 'Tumaga', lat: 6.9357, lng: 122.0788, price: 82 },
  { id: 'zone4', name: 'Zone IV', lat: 6.9042, lng: 122.0786, price: 0, role: 'buyer' },
];

/** The rider's route: from the farm (Mercedes) through Tumaga to the buyer in Zone IV. */
export const ROUTE: [number, number][] = [
  project(6.9576, 122.1444),
  project(6.95, 122.105),
  project(6.9357, 122.0788),
  project(6.9042, 122.0786),
];

/** Extra land blobs so the stylised island looks connected. */
export const LAND_FILLERS: [number, number, number][] = [
  [100, 150, 44],
  [130, 160, 44],
  [200, 150, 44],
];
