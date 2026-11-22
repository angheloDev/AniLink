import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { DEFAULT_PREFS, type NotifPrefs } from '../lib/notificationRules';

const KEY = 'anilink.notifPrefs';

interface PrefsState {
  prefs: NotifPrefs;
  load: () => Promise<void>;
  set: (patch: Partial<NotifPrefs>) => void;
}

export const useNotifPrefs = create<PrefsState>((set, get) => ({
  prefs: DEFAULT_PREFS,
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ prefs: { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotifPrefs>) } });
    } catch {
      /* keep defaults */
    }
  },
  set(patch) {
    const prefs = { ...get().prefs, ...patch };
    set({ prefs });
    AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => undefined);
  },
}));
