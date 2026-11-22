import { getServerUrl } from './server';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

let tokenGetter: () => string | null = () => null;
let unauthorized: (() => void) | null = null;

export function setTokenGetter(fn: () => string | null): void {
  tokenGetter = fn;
}
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorized = fn;
}

export async function api<T>(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: unknown, opts: { timeoutMs?: number } = {}): Promise<T> {
  const base = await getServerUrl();
  const token = tokenGetter();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10000);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    if (res.status === 401 && token) unauthorized?.();
    throw new ApiError(res.status, message);
  }
  return data as T;
}

/** multipart upload of local image files. Returns server urls like /uploads/<id>.jpg */
export async function uploadImages(uris: string[]): Promise<string[]> {
  const base = await getServerUrl();
  const token = tokenGetter();
  const form = new FormData();
  uris.forEach((uri, i) => {
    const name = uri.split('/').pop() || `photo-${i}.jpg`;
    const ext = name.split('.').pop()?.toLowerCase();
    const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    form.append('files', { uri, name, type } as unknown as Blob);
  });
  let res: Response;
  try {
    res = await fetch(`${base}/api/uploads`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
  } catch {
    throw new NetworkError();
  }
  const data = (await res.json().catch(() => null)) as { urls?: string[]; error?: string } | null;
  if (!res.ok || !data?.urls) throw new ApiError(res.status, data?.error ?? 'Upload failed');
  return data.urls;
}
