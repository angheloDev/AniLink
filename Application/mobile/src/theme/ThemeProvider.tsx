import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, type Colors } from './tokens';

export type ThemeMode = 'system' | 'dark' | 'light';
export const THEME_KEY = 'anilink.themeMode';

export interface ThemeValue {
  colors: Colors;
  mode: ThemeMode;
  resolved: 'dark' | 'light';
  ready: boolean;
  setMode: (m: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light' || saved === 'system') setModeState(saved);
      } catch {
        /* storage unavailable: keep default */
      }
      setReady(true);
    })();
  }, []);

  const setMode = useCallback(async (m: ThemeMode) => {
    setModeState(m);
    try {
      await AsyncStorage.setItem(THEME_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const resolved: 'dark' | 'light' = mode === 'system' ? (scheme === 'light' ? 'light' : 'dark') : mode;
  const value = useMemo<ThemeValue>(
    () => ({ colors: tokens[resolved], mode, resolved, ready, setMode }),
    [resolved, mode, ready, setMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
