import data from '../data/barangays.json';
import aliases from '../data/barangayAliases.json';

export interface Barangay {
  name: string;
  lat: number;
  lng: number;
}

/** All 98 official barangays of Zamboanga City (PSA/PSGC spellings), sorted A to Z. */
export const BARANGAYS: Barangay[] = data as Barangay[];

/** Center of Zamboanga City, used as the default map center. */
export const ZAMBOANGA_CENTER = { lat: 6.9214, lng: 122.079 };

/** Lower-case and strip accents so "santo nino" finds "Santo Niño". */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Maps a spelling saved by an earlier version (e.g. "Sta. Maria") to the official one. Unknown names pass through. */
export function normalizeBarangayName(name: string): string {
  return (aliases as Record<string, string>)[name.trim().toLowerCase()] ?? name;
}

export function filterBarangays(query: string): Barangay[] {
  const q = fold(query.trim());
  if (!q) return BARANGAYS;
  return BARANGAYS.filter((b) => fold(b.name).includes(q));
}

export function barangayCoords(name: string): { lat: number; lng: number } | null {
  const wanted = normalizeBarangayName(name).trim().toLowerCase();
  const b = BARANGAYS.find((x) => x.name.toLowerCase() === wanted);
  return b ? { lat: b.lat, lng: b.lng } : null;
}
