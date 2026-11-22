import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero, HERO_CYCLE_MS } from '../src/components/Hero';
import { Stats } from '../src/components/Stats';
import { en } from '../src/content/en';
import { STATS } from '../src/content/stats';
import { useCycle } from '../src/lib/useCycle';
import { renderWithProviders } from './utils';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  // @ts-expect-error remove the matchMedia test double
  delete window.matchMedia;
});

function allowReducedMotion() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
}

describe('useCycle', () => {
  it('advances every interval and wraps around', () => {
    const { result } = renderHook(() => useCycle(3, 1000, true));
    expect(result.current).toBe(0);
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);
    act(() => void vi.advanceTimersByTime(2000));
    expect(result.current).toBe(0);
  });
  it('stays at 0 when disabled', () => {
    const { result } = renderHook(() => useCycle(3, 1000, false));
    act(() => void vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(0);
  });
});

describe('Hero', () => {
  it('has the tagline eyebrow, the headline and the three feature chips', () => {
    renderWithProviders(<Hero />);
    expect(screen.getByText('GAWANG LOKAL. PARA SA BAYAN.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en['hero.headline1']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en['hero.headline2']);
    for (const k of ['hero.chip1', 'hero.chip2', 'hero.chip3'] as const) expect(screen.getByText(en[k])).toBeInTheDocument();
  });

  it('has both store buttons, Google Play first, and a click opens the facade', () => {
    renderWithProviders(<Hero />);
    const buttons = screen.getAllByRole('button', { name: /Google Play|App Store/ });
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Google Play');
    expect(buttons[1]).toHaveTextContent('App Store');
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Google Play');
  });

  it('cycles the phone home -> listing -> chat -> home', () => {
    renderWithProviders(<Hero />);
    expect(screen.getByTestId('screen-home')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(HERO_CYCLE_MS));
    expect(screen.getByTestId('screen-listing')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(HERO_CYCLE_MS));
    expect(screen.getByTestId('screen-chat')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(HERO_CYCLE_MS));
    expect(screen.getByTestId('screen-home')).toBeInTheDocument();
  });

  it('under reduced motion the phone never cycles and no scroll parallax is attached', () => {
    allowReducedMotion();
    const add = vi.spyOn(window, 'addEventListener');
    renderWithProviders(<Hero />);
    act(() => void vi.advanceTimersByTime(HERO_CYCLE_MS * 5));
    expect(screen.getByTestId('screen-home')).toBeInTheDocument();
    expect(add.mock.calls.some(([type]) => type === 'scroll')).toBe(false);
  });
});

describe('Stats', () => {
  it('shows the four true figures', () => {
    renderWithProviders(<Stats />);
    expect(screen.getByText(String(STATS.barangays))).toBeInTheDocument();
    expect(screen.getByText(String(STATS.categories))).toBeInTheDocument();
    expect(screen.getByText(String(STATS.languages))).toBeInTheDocument();
    expect(screen.getByText(en['stats.chat'])).toBeInTheDocument();
    expect(screen.getByText(en['stats.barangays'])).toBeInTheDocument();
  });
});
