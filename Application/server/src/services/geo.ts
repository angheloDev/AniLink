import barangays from '../../../mobile/src/data/barangays.json';
import aliases from '../../../mobile/src/data/barangayAliases.json';

export interface LatLng {
  lat: number;
  lng: number;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const BARANGAYS = barangays as { name: string; lat: number; lng: number }[];

/** Old spellings saved by earlier versions (e.g. "Sta. Maria") still resolve to the official barangay. */
export function barangayCoords(name: string): LatLng | null {
  const key = name.trim().toLowerCase();
  const wanted = ((aliases as Record<string, string>)[key] ?? key).toLowerCase();
  const b = BARANGAYS.find((x) => x.name.toLowerCase() === wanted);
  return b ? { lat: b.lat, lng: b.lng } : null;
}
