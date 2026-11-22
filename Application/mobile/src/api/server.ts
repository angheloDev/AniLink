import AsyncStorage from '@react-native-async-storage/async-storage';

export const SERVER_KEY = 'anilink.serverUrl';
// 10.0.2.2 is how the Android emulator reaches the host PC.
const FALLBACK = 'http://10.0.2.2:4000';

let cached: string | null = null;

export function normalizeServerUrl(raw: string): string {
  const v = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/]+/i.test(v)) throw new Error('Server address must start with http:// or https://');
  return v;
}

export function resetServerCache(): void {
  cached = null;
}

export async function getServerUrl(): Promise<string> {
  if (cached) return cached;
  let saved: string | null = null;
  try {
    saved = await AsyncStorage.getItem(SERVER_KEY);
  } catch {
    /* ignore */
  }
  const value = saved || process.env.EXPO_PUBLIC_API_URL || FALLBACK;
  cached = value;
  return value;
}

/** Synchronous read for places that cannot await (image urls). Valid after getServerUrl() has run once. */
export function getCachedServerUrl(): string {
  return cached ?? process.env.EXPO_PUBLIC_API_URL ?? FALLBACK;
}

export async function setServerUrl(raw: string): Promise<string> {
  const url = normalizeServerUrl(raw);
  await AsyncStorage.setItem(SERVER_KEY, url);
  cached = url;
  return url;
}

export async function testConnection(url: string, timeoutMs = 4000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/api/health`, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** "/uploads/x.png" -> "http://host:4000/uploads/x.png"; absolute urls pass through; null stays null. */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('file:') || path.startsWith('data:')) return path;
  return `${getCachedServerUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}
