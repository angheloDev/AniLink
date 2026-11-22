import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { fonts, radii, tintFor, tokens } from '../src/theme/tokens';
import { useTheme } from '../src/theme/useTheme';

let mockScheme: 'light' | 'dark' | null = 'light';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => mockScheme }));

const wrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockScheme = 'light';
});

describe('tokens', () => {
  it('has identical key sets for dark and light', () => {
    expect(Object.keys(tokens.light).sort()).toEqual(Object.keys(tokens.dark).sort());
  });

  it('uses the Fieldlink-derived dark palette', () => {
    expect(tokens.dark.bg).toBe('#1F1E1B');
    expect(tokens.dark.surface).toBe('#272622');
    expect(tokens.dark.primary).toBe('#1E4A3D');
    expect(tokens.dark.headline).toBe('#BEE3CF');
    expect(tokens.dark.accent).toBe('#E8834A');
    expect(tokens.dark.sun).toBe('#F0C04B');
  });

  it('defines the light palette', () => {
    expect(tokens.light.bg).toBe('#F6F3EC');
    expect(tokens.light.surface).toBe('#FFFFFF');
    expect(tokens.light.primary).toBe('#1E5A45');
    expect(tokens.light.text).toBe('#1F1E1B');
  });

  it('exposes Poppins fonts and radii', () => {
    expect(fonts.regular).toBe('Poppins_400Regular');
    expect(fonts.bold).toBe('Poppins_700Bold');
    expect(radii.card).toBe(24);
  });

  it('maps categories to tints and falls back for unknown ones', () => {
    expect(tintFor(tokens.dark, 'vegetables')).toBe(tokens.dark.tintTomato);
    expect(tintFor(tokens.dark, 'fruits')).toBe(tokens.dark.tintBanana);
    expect(tintFor(tokens.dark, 'leafy')).toBe(tokens.dark.tintLeafy);
    expect(tintFor(tokens.dark, 'nonsense')).toBe(tokens.dark.surface);
  });
});

describe('useTheme', () => {
  it('resolves system mode from the device color scheme', async () => {
    mockScheme = 'light';
    const { result } = await renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('light');
    expect(result.current.colors.bg).toBe('#F6F3EC');
  });

  it('defaults to dark when the device reports no scheme', async () => {
    mockScheme = null;
    const { result } = await renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.resolved).toBe('dark');
  });

  it('setMode switches the theme and persists the choice', async () => {
    const { result } = await renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      await result.current.setMode('dark');
    });
    expect(result.current.resolved).toBe('dark');
    expect(result.current.colors.bg).toBe('#1F1E1B');
    expect(await AsyncStorage.getItem('anilink.themeMode')).toBe('dark');
  });

  it('restores a saved mode on startup', async () => {
    await AsyncStorage.setItem('anilink.themeMode', 'light');
    mockScheme = 'dark';
    const { result } = await renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
  });
});
