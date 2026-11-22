import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../src/api/client';
import type { UserDTO } from '../src/api/types';
import { useAuth } from '../src/store/auth';

const user: UserDTO = {
  id: 'u1',
  name: 'Carla',
  email: 'carla@x.com',
  role: 'buyer',
  photoUrl: null,
  phone: null,
  barangay: 'Tetuan',
  farm: null,
  verification: { status: 'none' },
  ratingAvg: 0,
  ratingCount: 0,
  language: 'en',
  onboarded: true,
  createdAt: '2026-11-01T00:00:00.000Z',
};

const mockFetch = jest.fn();
beforeEach(async () => {
  await AsyncStorage.clear();
  useAuth.setState({ token: null, user: null, ready: false, offline: false });
  mockFetch.mockReset();
  (globalThis as { fetch: unknown }).fetch = mockFetch;
});

describe('auth store', () => {
  it('signIn keeps the session and load restores it after a restart', async () => {
    await useAuth.getState().signIn('tok', user);
    expect(useAuth.getState().token).toBe('tok');
    useAuth.setState({ token: null, user: null, ready: false });
    await useAuth.getState().load();
    expect(useAuth.getState().token).toBe('tok');
    expect(useAuth.getState().user?.name).toBe('Carla');
    expect(useAuth.getState().ready).toBe(true);
  });

  it('signOut clears the session everywhere', async () => {
    await useAuth.getState().signIn('tok', user);
    await useAuth.getState().signOut();
    expect(useAuth.getState().token).toBeNull();
    useAuth.setState({ ready: false });
    await useAuth.getState().load();
    expect(useAuth.getState().token).toBeNull();
    expect(useAuth.getState().user).toBeNull();
  });

  it('load with no saved session is ready and signed out', async () => {
    await useAuth.getState().load();
    expect(useAuth.getState().ready).toBe(true);
    expect(useAuth.getState().token).toBeNull();
  });

  it('refreshMe updates the user, and marks offline without signing out when the server is unreachable', async () => {
    await useAuth.getState().signIn('tok', user);
    mockFetch.mockReturnValueOnce(Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ user: { ...user, name: 'Carla M.' } }) }));
    await useAuth.getState().refreshMe();
    expect(useAuth.getState().user?.name).toBe('Carla M.');
    expect(useAuth.getState().offline).toBe(false);

    mockFetch.mockReturnValueOnce(Promise.reject(new TypeError('down')));
    await useAuth.getState().refreshMe();
    expect(useAuth.getState().offline).toBe(true);
    expect(useAuth.getState().token).toBe('tok');
  });

  it('signs out automatically when the server rejects the token', async () => {
    await useAuth.getState().signIn('tok', user);
    mockFetch.mockReturnValueOnce(Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Not authenticated' }) }));
    await expect(api('GET', '/api/me')).rejects.toBeTruthy();
    expect(useAuth.getState().token).toBeNull();
  });
});
