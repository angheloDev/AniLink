import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { ApiError, NetworkError, api, setTokenGetter, setUnauthorizedHandler } from '../api/client';
import type { UserDTO } from '../api/types';
import { connectSocket, disconnectSocket } from '../socket';

const TOKEN_KEY = 'anilink.token';
const USER_KEY = 'anilink.user';

async function readToken(): Promise<string | null> {
  try {
    const t = await SecureStore.getItemAsync(TOKEN_KEY);
    if (t) return t;
  } catch {
    /* secure store unavailable: fall through */
  }
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writeToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* fall back below */
  }
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Inert stand-in used while signed out so signed-in screens never crash during the sign-out transition. */
const SIGNED_OUT_USER: UserDTO = {
  id: '',
  name: '',
  email: '',
  role: 'buyer',
  photoUrl: null,
  phone: null,
  barangay: null,
  farm: null,
  verification: { status: 'none' },
  ratingAvg: 0,
  ratingCount: 0,
  language: 'en',
  onboarded: false,
  createdAt: new Date(0).toISOString(),
};

interface AuthState {
  token: string | null;
  user: UserDTO | null;
  ready: boolean;
  offline: boolean;
  load: () => Promise<void>;
  signIn: (token: string, user: UserDTO) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserDTO) => void;
  refreshMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ready: false,
  offline: false,

  async load() {
    const token = await readToken();
    let user: UserDTO | null = null;
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw && token) user = JSON.parse(raw) as UserDTO;
    } catch {
      /* ignore corrupt cache */
    }
    set({ token, user, ready: true });
    if (token) void connectSocket(token);
  },

  async signIn(token, user) {
    await writeToken(token);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    set({ token, user, offline: false });
    void connectSocket(token);
  },

  async signOut() {
    disconnectSocket();
    set({ token: null, user: null });
    await writeToken(null);
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },

  setUser(user) {
    set({ user });
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => undefined);
  },

  async refreshMe() {
    if (!get().token) return;
    try {
      const { user } = await api<{ user: UserDTO }>('GET', '/api/me', undefined, { timeoutMs: 6000 });
      get().setUser(user);
      set({ offline: false });
    } catch (e) {
      if (e instanceof NetworkError) set({ offline: true });
      else if (e instanceof ApiError && e.status === 401) await get().signOut();
    }
  },
}));

setTokenGetter(() => useAuth.getState().token);
setUnauthorizedHandler(() => {
  void useAuth.getState().signOut();
});

/** The signed-in user, or an inert placeholder if the session just ended (the root layout then navigates away). */
export function useCurrentUser(): UserDTO {
  return useAuth((s) => s.user) ?? SIGNED_OUT_USER;
}
