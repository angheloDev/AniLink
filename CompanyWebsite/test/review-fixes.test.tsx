import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Nav } from '../src/components/Nav';
import { Stats } from '../src/components/Stats';
import { AlertsScreen } from '../src/components/screens/AlertsScreen';
import { COOLDOWN_MS, OfferChatScreen } from '../src/components/screens/OfferChatScreen';
import { OrderScreen } from '../src/components/screens/OrderScreen';
import { VerifiedScreen } from '../src/components/screens/VerifiedScreen';
import { en } from '../src/content/en';
import { tl } from '../src/content/tl';
import { STEP_COOLDOWN_MS } from '../src/lib/stepper';
import { renderWithProviders } from './utils';

/* ---------- colour contrast (WCAG) computed from the real theme.css ---------- */
const css = readFileSync(resolve(import.meta.dirname, '../src/styles/theme.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return {};
  const open = css.indexOf('{', start);
  const body = css.slice(open + 1, css.indexOf('}', open));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (h: string) => {
  const [r, g, b] = rgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const blend = (fg: string, bg: string, a: number) =>
  '#' + rgb(fg).map((c, i) => Math.round(c * a + rgb(bg)[i] * (1 - a)).toString(16).padStart(2, '0')).join('');

describe.each(['dark', 'light'] as const)('contrast in the %s theme (small text needs 4.5:1)', (theme) => {
  const base = block(`:root[data-theme='${theme}']`);
  const onGreen = { ...base, ...block(`:root[data-theme='${theme}'] .on-green`) };

  it('muted and eyebrow text stay readable on the green bands (How it works, Download, Footer)', () => {
    for (const bg of [base['section-green'], base['deep-green']]) {
      expect(ratio(onGreen['muted'], bg), `muted on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(onGreen['eyebrow'], bg), `eyebrow on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('accent-text is readable as small text, alone and inside an accent/15 badge', () => {
    const accent = base['accent-text'];
    expect(accent, 'accent-text token exists').toBeTruthy();
    for (const bg of [base['bg'], base['surface'], base['card']]) {
      expect(ratio(accent, bg), `accent-text on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(accent, blend(base['accent'], bg, 0.15)), `accent-text on badge over ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('sun-text is readable on its sample/placeholder pills wherever they sit', () => {
    for (const bg of [base['bg'], base['surface'], base['card'], base['deep-green']]) {
      expect(ratio(base['sun-text'], blend(base['sun'], bg, 0.15)), `sun-text on pill over ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(ratio(base['sun-text'], base['tint-banana'])).toBeGreaterThanOrEqual(4.5);
  });

  it('text on the solid primary buyer bubble is readable', () => {
    expect(ratio(base['primary-text'], base['primary'])).toBeGreaterThanOrEqual(4.5);
  });
});

/* ---------- R1: the buyer's offer cards ---------- */
describe('buyer offer card', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('is a solid primary bubble with no muted/eyebrow text that could vanish in light mode', () => {
    renderWithProviders(<OfferChatScreen />);
    fireEvent.click(screen.getByTestId('offer-action'));
    const card = screen.getByText(en['offer.cardOffer']).closest('div') as HTMLElement;
    expect(card.className).toContain('bg-primary');
    expect(card.className).not.toMatch(/bg-primary\//);
    const classes = [card, ...Array.from(card.querySelectorAll('*'))].map((e) => e.getAttribute('class') ?? '').join(' ');
    expect(classes).not.toMatch(/text-muted|text-eyebrow/);
  });
});

/* ---------- R3 + R5: the mobile menu ---------- */
function controllableMatchMedia() {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mq = {
    matches: false,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
  };
  window.matchMedia = vi.fn().mockReturnValue(mq) as unknown as typeof window.matchMedia;
  return {
    set(matches: boolean) {
      mq.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
}

describe('mobile menu', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.overflow = '';
  });
  afterEach(() => {
    // @ts-expect-error remove the matchMedia test double
    delete window.matchMedia;
    document.documentElement.style.overflow = '';
  });

  it('closes itself and gives scrolling back when the viewport grows to desktop width', async () => {
    const mm = controllableMatchMedia();
    renderWithProviders(<Nav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: en['nav.menu'] }));
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe('hidden');
    act(() => mm.set(true));
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('after "Get the app" from the menu, closing the store overlay returns focus to the hamburger', async () => {
    renderWithProviders(<Nav />);
    const user = userEvent.setup();
    const burger = screen.getByRole('button', { name: en['nav.menu'] });
    await user.click(burger);
    await user.click(within(screen.getByTestId('mobile-menu')).getByRole('button', { name: en['nav.getApp'] }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(burger);
  });
});

/* ---------- R4: copy that must stay true ---------- */
describe('on-page claims stay true', () => {
  it('does not say people speak English and Tagalog every day (Zamboanga speaks Chavacano)', () => {
    expect(en['about.local.desc']).not.toMatch(/every ?day/i);
    expect(tl['about.local.desc']).not.toMatch(/araw-araw/i);
  });
  it('does not claim everything on screen is clickable', () => {
    expect(en['features.blurb']).not.toMatch(/everything/i);
    expect(tl['features.blurb']).not.toMatch(/lahat ng nasa screen/i);
  });
  it('does not say the 98 barangays are "on the map" (the demo map has six pins)', () => {
    expect(en['stats.barangays']).not.toMatch(/map/i);
    expect(tl['stats.barangays']).not.toMatch(/map/i);
  });
});

/* ---------- R6 + R9: demo buttons keep keyboard focus; Replay is 44px wide ---------- */
describe('demo buttons for keyboard users', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  const resetButton = () => screen.getByRole('button', { name: en['offer.reset'] });

  it('offer demo: the action button stays focused (aria-disabled, not disabled) and focus lands on Reset at the end', () => {
    renderWithProviders(<OfferChatScreen />);
    const b = screen.getByTestId('offer-action');
    b.focus();
    fireEvent.click(b);
    expect(b).not.toBeDisabled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
    expect(document.activeElement).toBe(b);
    act(() => void vi.advanceTimersByTime(COOLDOWN_MS));
    expect(b).toHaveAttribute('aria-disabled', 'false');
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByTestId('offer-action'));
      act(() => void vi.advanceTimersByTime(COOLDOWN_MS));
    }
    expect(screen.queryByTestId('offer-action')).toBeNull();
    expect(document.activeElement).toBe(resetButton());
  });

  it.each([
    ['alerts', AlertsScreen, 2],
    ['order', OrderScreen, 4],
  ] as const)('%s demo: same focus behaviour', (_name, Screen, steps) => {
    renderWithProviders(<Screen />);
    const b = screen.getByTestId('step-action');
    b.focus();
    fireEvent.click(b);
    expect(b).not.toBeDisabled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
    expect(document.activeElement).toBe(b);
    act(() => void vi.advanceTimersByTime(STEP_COOLDOWN_MS));
    for (let i = 1; i < steps; i++) {
      fireEvent.click(screen.getByTestId('step-action'));
      act(() => void vi.advanceTimersByTime(STEP_COOLDOWN_MS));
    }
    expect(screen.queryByTestId('step-action')).toBeNull();
    expect(document.activeElement).toBe(resetButton());
  });

  it('a click during the cooldown is still ignored', () => {
    renderWithProviders(<OfferChatScreen />);
    const b = screen.getByTestId('offer-action');
    fireEvent.click(b);
    fireEvent.click(b);
    expect(screen.getAllByText(en['offer.cardOffer'])).toHaveLength(1);
    expect(screen.queryByText(en['offer.cardCounter'])).toBeNull();
  });

  it('the Replay button is at least 44px wide', () => {
    renderWithProviders(<VerifiedScreen />);
    expect(screen.getByRole('button', { name: en['verified.replay'] }).className).toMatch(/min-w-11|px-4|px-5|px-6/);
  });
});

/* ---------- R11: narrow-width layout guards (the real check is a browser; these pin the fix) ---------- */
describe('layout guards found by the browser check', () => {
  it('desktop nav links never wrap onto two lines (Tagalog is longer)', () => {
    renderWithProviders(<Nav />);
    const links = Array.from(document.querySelectorAll('nav[aria-label="Primary"] a'));
    expect(links.length).toBe(4);
    for (const a of links) expect(a.className).toContain('whitespace-nowrap');
  });

  it('stat labels may break instead of spilling out of their tile on a 320px phone', () => {
    renderWithProviders(<Stats />);
    const labels = Array.from(document.querySelectorAll('#stats dt'));
    expect(labels.length).toBe(4);
    for (const dt of labels) expect(dt.className).toContain('break-words');
  });
});
