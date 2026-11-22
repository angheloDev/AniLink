import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, NetworkError, api, setTokenGetter, setUnauthorizedHandler } from '../src/api/client';
import { assetUrl, getServerUrl, normalizeServerUrl, resetServerCache, setServerUrl, testConnection } from '../src/api/server';
import { buildQuery } from '../src/api/query';
import { dispatchSocketEvent, onSocket } from '../src/socket';

const mockFetch = jest.fn();
beforeEach(async () => {
  await AsyncStorage.clear();
  resetServerCache();
  mockFetch.mockReset();
  (globalThis as { fetch: unknown }).fetch = mockFetch;
  setTokenGetter(() => null);
  setUnauthorizedHandler(null);
  process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.5:4000';
});

const ok = (body: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

describe('server url', () => {
  it('rejects anything that is not an http(s) address', async () => {
    await expect(setServerUrl('ftp://x')).rejects.toThrow();
    await expect(setServerUrl('192.168.1.5:4000')).rejects.toThrow();
    await expect(setServerUrl('')).rejects.toThrow();
  });

  it('trims whitespace and trailing slashes, and persists', async () => {
    expect(normalizeServerUrl('  http://10.0.0.2:4000/// ')).toBe('http://10.0.0.2:4000');
    await setServerUrl('http://10.0.0.2:4000/');
    expect(await AsyncStorage.getItem('anilink.serverUrl')).toBe('http://10.0.0.2:4000');
    expect(await getServerUrl()).toBe('http://10.0.0.2:4000');
  });

  it('falls back to EXPO_PUBLIC_API_URL when nothing is saved', async () => {
    expect(await getServerUrl()).toBe('http://192.168.1.5:4000');
  });

  it('turns upload paths into absolute asset urls', async () => {
    await setServerUrl('http://10.0.0.2:4000');
    expect(assetUrl('/uploads/a.png')).toBe('http://10.0.0.2:4000/uploads/a.png');
    expect(assetUrl('https://cdn.test/x.png')).toBe('https://cdn.test/x.png');
    expect(assetUrl(null)).toBeNull();
  });
});

describe('testConnection', () => {
  it('is true for a healthy server', async () => {
    mockFetch.mockReturnValue(ok({ ok: true }));
    expect(await testConnection('http://x:4000')).toBe(true);
    expect(mockFetch.mock.calls[0][0]).toBe('http://x:4000/api/health');
  });

  it('is false for an error response or a network failure', async () => {
    mockFetch.mockReturnValueOnce(ok({}, 500));
    expect(await testConnection('http://x:4000')).toBe(false);
    mockFetch.mockReturnValueOnce(Promise.reject(new Error('down')));
    expect(await testConnection('http://x:4000')).toBe(false);
  });

  it('gives up after the timeout when the server never answers', async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(
      (_u: string, init: { signal: AbortSignal }) => new Promise((_res, rej) => init.signal.addEventListener('abort', () => rej(new Error('aborted')))),
    );
    const p = testConnection('http://x:4000', 4000);
    await jest.advanceTimersByTimeAsync(4100);
    expect(await p).toBe(false);
    jest.useRealTimers();
  });
});

describe('api', () => {
  it('sends the bearer token and JSON body, and returns parsed JSON', async () => {
    setTokenGetter(() => 'tok123');
    mockFetch.mockReturnValue(ok({ hello: 'world' }));
    const r = await api<{ hello: string }>('POST', '/api/things', { a: 1 });
    expect(r.hello).toBe('world');
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('http://192.168.1.5:4000/api/things');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('throws ApiError with status and server message on failures', async () => {
    mockFetch.mockReturnValue(ok({ error: 'Email already registered' }, 409));
    await expect(api('POST', '/api/auth/register', {})).rejects.toMatchObject({ name: 'ApiError', status: 409, message: 'Email already registered' });
    await expect(api('POST', '/x')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws NetworkError when the request cannot be made', async () => {
    mockFetch.mockReturnValue(Promise.reject(new TypeError('Network request failed')));
    await expect(api('GET', '/api/me')).rejects.toBeInstanceOf(NetworkError);
  });

  it('calls the unauthorized handler on 401 when a token was sent', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    setTokenGetter(() => 'expired');
    mockFetch.mockReturnValue(ok({ error: 'Not authenticated' }, 401));
    await expect(api('GET', '/api/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call the unauthorized handler for a wrong-password 401 without a token', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch.mockReturnValue(ok({ error: 'Wrong email or password' }, 401));
    await expect(api('POST', '/api/auth/login', {})).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('socket event bus', () => {
  it('delivers events to subscribers until they unsubscribe', () => {
    const fn = jest.fn();
    const off = onSocket('message:new', fn);
    dispatchSocketEvent('message:new', { message: { id: '1' } });
    expect(fn).toHaveBeenCalledWith({ message: { id: '1' } });
    off();
    dispatchSocketEvent('message:new', { message: { id: '2' } });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('buildQuery', () => {
  it('encodes values, converts booleans to 1, and skips empty ones', () => {
    expect(buildQuery({ q: 'ñandú & mango', verifiedOnly: true, minPrice: 0, category: undefined, barangay: '', delivery: false })).toBe(
      '?q=%C3%B1and%C3%BA%20%26%20mango&verifiedOnly=1&minPrice=0',
    );
    expect(buildQuery({})).toBe('');
  });
});
