import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { applyServerUrl } from '../src/api/applyServer';
import { resetServerCache } from '../src/api/server';
import { useRealtimeSync } from '../src/api/hooks';
import type { MessageDTO, UserDTO } from '../src/api/types';
import { appendOlder } from '../src/lib/messageList';
import { markNavReady, resetNavReady, whenNavReady } from '../src/lib/navReady';
import { dispatchSocketEvent } from '../src/socket';
import { useAuth, useCurrentUser } from '../src/store/auth';

const user: UserDTO = {
  id: 'u1',
  name: 'Carla',
  email: 'c@x.com',
  role: 'buyer',
  photoUrl: null,
  phone: null,
  barangay: null,
  farm: null,
  verification: { status: 'none' },
  ratingAvg: 0,
  ratingCount: 0,
  language: 'en',
  onboarded: true,
  createdAt: '2026-11-01T00:00:00.000Z',
};

const msg = (id: string): MessageDTO => ({ id, conversationId: 'c1', senderId: 'u1', type: 'text', text: id, imageUrl: null, offer: null, orderId: null, readAt: null, createdAt: '2026-11-21T10:00:00.000Z' });

const mockFetch = jest.fn();
beforeEach(async () => {
  await AsyncStorage.clear();
  resetServerCache();
  useAuth.setState({ token: null, user: null, ready: true, offline: false });
  mockFetch.mockReset();
  (globalThis as { fetch: unknown }).fetch = mockFetch;
});

describe('useCurrentUser (signing out while a signed-in screen is mounted must not crash it)', () => {
  it('returns the signed-in user', async () => {
    useAuth.setState({ token: 't', user });
    const { result } = await renderHook(() => useCurrentUser());
    expect(result.current.id).toBe('u1');
  });

  it('returns an inert placeholder when there is no user instead of null', async () => {
    const { result } = await renderHook(() => useCurrentUser());
    expect(result.current).toMatchObject({ id: '', role: 'buyer', onboarded: false, verification: { status: 'none' } });
    expect(() => result.current.name.split(' ')[0]).not.toThrow();
  });
});

describe('appendOlder', () => {
  it('adds older messages after the existing ones without duplicates', () => {
    const out = appendOlder([msg('m5'), msg('m4')], [msg('m4'), msg('m3'), msg('m2')]);
    expect(out.map((m) => m.id)).toEqual(['m5', 'm4', 'm3', 'm2']);
  });

  it('copes with an empty or missing list', () => {
    expect(appendOlder(undefined, [msg('a')]).map((m) => m.id)).toEqual(['a']);
    expect(appendOlder([msg('a')], []).map((m) => m.id)).toEqual(['a']);
  });
});

describe('realtime sync keeps the farmer dashboard fresh', () => {
  it.each([
    ['offer:update', { offer: { id: 'o1', conversationId: 'c1' } }],
    ['order:update', { order: { id: 'ord1' } }],
    ['notification:new', { notification: { id: 'n1' } }],
  ])('invalidates the dashboard on %s', async (event, payload) => {
    useAuth.setState({ token: 't', user });
    const qc = new QueryClient();
    const spy = jest.spyOn(qc, 'invalidateQueries');
    await renderHook(() => useRealtimeSync(), { wrapper: ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider> });
    dispatchSocketEvent(event, payload);
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
  });
});

describe('applyServerUrl', () => {
  it('shows the offline banner when the new address cannot be reached', async () => {
    await useAuth.getState().signIn('tok', user);
    mockFetch.mockReturnValue(Promise.reject(new TypeError('down')));
    await applyServerUrl('http://10.9.9.9:4000');
    expect(useAuth.getState().offline).toBe(true);
    expect(useAuth.getState().token).toBe('tok');
  });

  it('clears the offline banner only after the new address answers', async () => {
    await useAuth.getState().signIn('tok', user);
    useAuth.setState({ offline: true });
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ user }) }));
    await applyServerUrl('http://192.168.1.71:4000/');
    expect(useAuth.getState().offline).toBe(false);
    expect(await AsyncStorage.getItem('anilink.serverUrl')).toBe('http://192.168.1.71:4000');
  });

  it('rejects an invalid address without touching anything', async () => {
    await expect(applyServerUrl('not a url')).rejects.toThrow();
    expect(await AsyncStorage.getItem('anilink.serverUrl')).toBeNull();
  });
});

describe('navReady', () => {
  beforeEach(() => resetNavReady());

  it('holds callers until navigation is ready, then releases them (and stays released)', async () => {
    let released = false;
    const p = whenNavReady().then(() => {
      released = true;
    });
    await Promise.resolve();
    expect(released).toBe(false);
    markNavReady();
    await p;
    expect(released).toBe(true);
    await expect(whenNavReady()).resolves.toBeUndefined();
  });
});
