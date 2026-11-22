import { act, fireEvent, renderHook, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreButton } from '../src/components/StoreButton';
import { en } from '../src/content/en';
import { I18nProvider } from '../src/lib/i18n';
import { REDIRECT_MS, StoreProvider, useStore } from '../src/lib/store';
import { ThemeProvider } from '../src/lib/theme';
import { renderWithProviders } from './utils';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <I18nProvider>
      <StoreProvider>{children}</StoreProvider>
    </I18nProvider>
  </ThemeProvider>
);

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe('store facade state', () => {
  it('goes closed -> redirecting -> card after REDIRECT_MS', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    expect(result.current.stage).toBe('closed');
    act(() => result.current.open('google'));
    expect(result.current.stage).toBe('redirecting');
    expect(result.current.store).toBe('google');
    act(() => void vi.advanceTimersByTime(REDIRECT_MS - 1));
    expect(result.current.stage).toBe('redirecting');
    act(() => void vi.advanceTimersByTime(1));
    expect(result.current.stage).toBe('card');
  });

  it('closing mid-redirect cancels the pending card for good', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => result.current.open('apple'));
    act(() => void vi.advanceTimersByTime(500));
    act(() => result.current.close());
    expect(result.current.stage).toBe('closed');
    act(() => void vi.advanceTimersByTime(REDIRECT_MS * 5));
    expect(result.current.stage).toBe('closed');
    expect(result.current.store).toBeNull();
  });

  it('a second open() while redirecting does not restart or stack the timer', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => result.current.open('google'));
    act(() => void vi.advanceTimersByTime(1000));
    act(() => result.current.open('google'));
    act(() => void vi.advanceTimersByTime(REDIRECT_MS - 1000));
    expect(result.current.stage).toBe('card');
  });

  it('can be reopened after closing', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => result.current.open('google'));
    act(() => result.current.close());
    act(() => result.current.open('apple'));
    expect(result.current.stage).toBe('redirecting');
    expect(result.current.store).toBe('apple');
  });
});

describe('store overlay', () => {
  it('shows the redirect, then the coming-soon card with a QR, and Close dismisses it', () => {
    renderWithProviders(<StoreButton store="google" />);
    fireEvent.click(screen.getByRole('button', { name: /Google Play/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Taking you to Google Play');
    act(() => void vi.advanceTimersByTime(REDIRECT_MS));
    expect(dialog).toHaveTextContent(en['store.soonTitle']);
    expect(within(dialog).getByTestId('qr-card')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: en['store.close'] }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('the App Store version says coming soon too', () => {
    renderWithProviders(<StoreButton store="apple" />);
    fireEvent.click(screen.getByRole('button', { name: /App Store/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('App Store');
    act(() => void vi.advanceTimersByTime(REDIRECT_MS));
    expect(screen.getByRole('dialog')).toHaveTextContent(/coming soon/i);
  });

  it('double-clicking a store button leaves exactly one overlay', () => {
    renderWithProviders(<StoreButton store="google" />);
    const btn = screen.getByRole('button', { name: /Google Play/ });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('Escape during the redirect closes it and no card appears later', () => {
    renderWithProviders(<StoreButton store="google" />);
    fireEvent.click(screen.getByRole('button', { name: /Google Play/ }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => void vi.advanceTimersByTime(REDIRECT_MS * 3));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
