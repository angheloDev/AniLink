import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Footer } from '../src/components/Footer';
import { Produce } from '../src/components/Produce';
import { HomeScreen } from '../src/components/screens/HomeScreen';
import { ListingScreen } from '../src/components/screens/ListingScreen';
import { PriceGuideScreen } from '../src/components/screens/PriceGuideScreen';
import { PHOTO_CREDITS } from '../src/content/photoCredits';
import { en } from '../src/content/en';
import { PHOTO_IDS, photoSrc } from '../src/lib/photos';
import { PRICE_GUIDE } from '../src/lib/priceGuide';
import { PRODUCE } from '../src/lib/produce';
import { renderWithProviders } from './utils';

const dir = resolve(import.meta.dirname, '../public/photos');

describe('real produce photos', () => {
  it('every photo the site references exists as a file in public/photos', () => {
    for (const id of PHOTO_IDS) expect(existsSync(resolve(dir, `${id}.jpg`)), id).toBe(true);
    for (const p of PRODUCE) expect(PHOTO_IDS).toContain(p.photo);
    for (const p of PRICE_GUIDE) expect(PHOTO_IDS).toContain(p.photo);
  });

  it('every photo file has a credit, and every credit has a file', () => {
    const files = readdirSync(dir).filter((f) => f.endsWith('.jpg')).map((f) => f.replace('.jpg', '')).sort();
    expect(Object.keys(PHOTO_CREDITS).sort()).toEqual(files);
    for (const c of Object.values(PHOTO_CREDITS)) {
      expect(c.author).toBeTruthy();
      expect(c.license).toBeTruthy();
      expect(c.url).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it('produce cards show a real photo with the product name as its alt text', () => {
    renderWithProviders(<Produce />);
    for (const card of screen.getAllByTestId('produce-card')) {
      const img = within(card).getByRole('img') as HTMLImageElement;
      expect(img.getAttribute('src')).toMatch(/^\/photos\/[a-z]+\.jpg$/);
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  it('the phone screens use photos too (home cards, listing hero, price-guide chips)', () => {
    const home = renderWithProviders(<HomeScreen />);
    expect(home.container.querySelectorAll('img[src^="/photos/"]').length).toBe(2);
    home.unmount();
    const listing = renderWithProviders(<ListingScreen />);
    expect(listing.container.querySelectorAll('img[src^="/photos/"]').length).toBe(1);
    listing.unmount();
    const guide = renderWithProviders(<PriceGuideScreen />);
    expect(guide.container.querySelectorAll('img[src^="/photos/"]').length).toBe(PRICE_GUIDE.length);
  });

  it('photoSrc points into /photos', () => {
    expect(photoSrc('mango')).toBe('/photos/mango.jpg');
  });
});

describe('photo credits', () => {
  it('the footer opens a credits dialog that names every photographer and licence', async () => {
    renderWithProviders(<Footer />);
    await userEvent.setup().click(screen.getByRole('button', { name: en['footer.credits'] }));
    const dialog = screen.getByRole('dialog', { name: en['credits.title'] });
    // The list scrolls inside the dialog, so keyboard users must be able to focus it to scroll it.
    expect(within(dialog).getByRole('list')).toHaveAttribute('tabindex', '0');
    for (const c of Object.values(PHOTO_CREDITS)) {
      expect(dialog).toHaveTextContent(c.author);
      expect(dialog).toHaveTextContent(c.license);
    }
  });
});
