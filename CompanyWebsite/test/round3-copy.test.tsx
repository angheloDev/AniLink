import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { QrCard } from '../src/components/QrCard';
import { StoreOverlay } from '../src/components/StoreOverlay';
import { en } from '../src/content/en';
import { tl } from '../src/content/tl';
import { renderWithProviders } from './utils';

const WORDS_THAT_SAY_NOT_LIVE = /prototype|demo|simulat|kunwari|preview|coming soon|malapit nang|being built|ginagawa pa|placeholder/i;

describe('QR codes', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ['English', 'en'],
    ['Tagalog', 'tl'],
  ] as const)('the QR code card never says "placeholder" (%s)', (_name, lang) => {
    localStorage.setItem('anilink.lang', lang);
    renderWithProviders(<QrCard url="https://example.com" />);
    const card = screen.getByTestId('qr-card');
    expect(card.textContent).not.toMatch(/placeholder/i);
    expect(card.querySelector('svg')?.getAttribute('aria-label') ?? '').not.toMatch(/placeholder/i);
  });

  it.each([
    ['English', 'en'],
    ['Tagalog', 'tl'],
  ] as const)('the store card that shows the QR code never says "placeholder" (%s)', (_name, lang) => {
    localStorage.setItem('anilink.lang', lang);
    renderWithProviders(<StoreOverlay stage="card" store="google" onClose={() => {}} />);
    expect(screen.getByRole('dialog').textContent).not.toMatch(/placeholder/i);
  });

  it('the QR copy tells people what to do with it', () => {
    expect(en['store.qrHint']).toMatch(/scan/i);
    expect(tl['store.qrHint']).toMatch(/scan/i);
  });
});

describe('FAQ answers assume AniLink is live and fully working', () => {
  const answers = (dict: Record<string, string>) => Object.entries(dict).filter(([k]) => /^faq\..+\.a$/.test(k));

  it.each([
    ['English', en as Record<string, string>],
    ['Tagalog', tl as Record<string, string>],
  ] as const)('no answer says prototype, demo, simulated, preview or coming soon (%s)', (_name, dict) => {
    const list = answers(dict);
    expect(list.length).toBeGreaterThanOrEqual(6);
    for (const [key, text] of list) expect(text, key).not.toMatch(WORDS_THAT_SAY_NOT_LIVE);
  });

  it('payments: yes, you can pay in the app', () => {
    expect(en['faq.payments.a']).toMatch(/^Yes/);
    expect(tl['faq.payments.a']).toMatch(/^Oo/);
  });

  it('phones: Android and iPhone, from the stores', () => {
    for (const text of [en['faq.platforms.a'], tl['faq.platforms.a']]) {
      expect(text).toMatch(/Android/);
      expect(text).toMatch(/iPhone/);
      expect(text).toMatch(/Google Play/);
      expect(text).toMatch(/App Store/);
    }
  });
});
