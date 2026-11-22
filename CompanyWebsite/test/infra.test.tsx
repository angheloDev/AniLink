import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageToggle } from '../src/components/LanguageToggle';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { en } from '../src/content/en';
import { tl } from '../src/content/tl';
import { I18nProvider, parseLang, useI18n } from '../src/lib/i18n';
import { useReducedMotion } from '../src/lib/reducedMotion';
import { safeGet, safeSet } from '../src/lib/storage';
import { ThemeProvider, parseTheme, useTheme } from '../src/lib/theme';
import { renderWithProviders } from './utils';

function Probe() {
  const { t } = useI18n();
  const { theme } = useTheme();
  return (
    <div>
      <p data-testid="copy">{t('nav.getApp')}</p>
      <p data-testid="steps">{t('common.stepOf', { n: 3, total: 6 })}</p>
      <p data-testid="theme">{theme}</p>
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.lang = 'en';
});
afterEach(() => vi.restoreAllMocks());

describe('parsing stored values', () => {
  it('falls back to dark for anything but "light"', () => {
    expect(parseTheme('purple')).toBe('dark');
    expect(parseTheme(null)).toBe('dark');
    expect(parseTheme('light')).toBe('light');
  });
  it('falls back to English for anything but "tl"', () => {
    expect(parseLang('fr')).toBe('en');
    expect(parseLang(null)).toBe('en');
    expect(parseLang('tl')).toBe('tl');
  });
});

describe('blocked or corrupted storage', () => {
  it('safeGet/safeSet never throw when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(safeGet('x')).toBeNull();
    expect(() => safeSet('x', 'y')).not.toThrow();
  });

  it('providers still render and toggles still work when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderWithProviders(<Probe />);
    const user = userEvent.setup();
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    await user.click(screen.getByRole('button', { name: en['toggle.themeLight'] }));
    expect(document.documentElement.dataset.theme).toBe('light');
    await user.click(screen.getByRole('button', { name: 'TL' }));
    expect(screen.getByTestId('copy')).toHaveTextContent(tl['nav.getApp']);
  });

  it('ignores corrupted stored values', () => {
    localStorage.setItem('anilink.theme', 'purple');
    localStorage.setItem('anilink.lang', 'fr');
    renderWithProviders(<Probe />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByTestId('copy')).toHaveTextContent(en['nav.getApp']);
  });
});

describe('theme', () => {
  it('toggling persists the choice and sets data-theme', async () => {
    renderWithProviders(<Probe />);
    const user = userEvent.setup();
    expect(document.documentElement.dataset.theme).toBe('dark');
    await user.click(screen.getByRole('button', { name: en['toggle.themeLight'] }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('anilink.theme')).toBe('light');
    expect(screen.getByRole('button', { name: en['toggle.themeLight'] })).toHaveAttribute('aria-pressed', 'true');
  });
  it('restores the stored theme on load', () => {
    localStorage.setItem('anilink.theme', 'light');
    render(
      <ThemeProvider>
        <I18nProvider>
          <Probe />
        </I18nProvider>
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('language', () => {
  it('switching to Tagalog changes copy, <html lang> and persists', async () => {
    renderWithProviders(<Probe />);
    const user = userEvent.setup();
    expect(screen.getByTestId('copy')).toHaveTextContent(en['nav.getApp']);
    await user.click(screen.getByRole('button', { name: 'TL' }));
    expect(screen.getByTestId('copy')).toHaveTextContent(tl['nav.getApp']);
    expect(document.documentElement.lang).toBe('tl');
    expect(localStorage.getItem('anilink.lang')).toBe('tl');
    expect(screen.getByRole('button', { name: 'TL' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });
  it('replaces {vars} in messages', () => {
    renderWithProviders(<Probe />);
    expect(screen.getByTestId('steps')).toHaveTextContent('Step 3 of 6');
  });
});

describe('dictionary parity', () => {
  it('every English key exists in Tagalog and no value is empty', () => {
    for (const key of Object.keys(en)) {
      expect(tl, `missing tl key ${key}`).toHaveProperty([key]);
      expect((tl as Record<string, string>)[key].trim().length, `empty tl ${key}`).toBeGreaterThan(0);
    }
    expect(Object.keys(tl).sort()).toEqual(Object.keys(en).sort());
  });
});

describe('useReducedMotion', () => {
  afterEach(() => {
    // @ts-expect-error cleanup of the test double
    delete window.matchMedia;
  });
  it('is true when the media query matches', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
  it('is false when matchMedia is unavailable', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => undefined);
  });
});
