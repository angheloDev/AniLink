import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { en } from '../src/content/en';
import { tl } from '../src/content/tl';

const root = resolve(import.meta.dirname, '..');
const read = (f: string) => readFileSync(resolve(root, f), 'utf8');

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
});

describe('App', () => {
  it('renders every section in the designed order', () => {
    const { container } = render(<App />);
    const order = ['#top', '#stats', '#features', '#how', '#produce', '#about', '#faq', '#download', 'footer'];
    const nodes = order.map((sel) => container.querySelector(sel));
    nodes.forEach((n, i) => expect(n, order[i]).not.toBeNull());
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i - 1]!.compareDocumentPosition(nodes[i]!) & Node.DOCUMENT_POSITION_FOLLOWING, order[i]).toBeTruthy();
    }
  });

  it('has a skip link that targets the main landmark', () => {
    const { container } = render(<App />);
    expect(screen.getByRole('link', { name: en['nav.skip'] })).toHaveAttribute('href', '#main');
    expect(container.querySelector('main#main')).not.toBeNull();
  });

  it('claims no invented counts of farmers, buyers, users or downloads', () => {
    const { container } = render(<App />);
    expect(container.textContent ?? '').not.toMatch(/\d[\d,.]*\s*(k|m|\+)?\s*(farmers|buyers|users|downloads)/i);
  });

  it('switching to Tagalog changes the headline and the nav links', async () => {
    render(<App />);
    const user = userEvent.setup();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en['hero.headline1']);
    await user.click(screen.getByRole('button', { name: 'TL' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tl['hero.headline1']);
    expect(screen.getAllByRole('link', { name: tl['nav.features'] }).length).toBeGreaterThan(0);
  });
});

describe('page metadata and README', () => {
  it('index.html has a title, a description and Open Graph tags', () => {
    const html = read('index.html');
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{20,}"/);
    for (const p of ['og:title', 'og:description', 'og:type']) expect(html, p).toContain(`property="${p}"`);
  });

  it('README names every placeholder shown on the page and how to run the site', () => {
    const readme = read('README.md').toLowerCase();
    for (const word of ['placeholder', 'contact', 'team', 'legal', 'qr', 'mission', 'npm run dev', 'npm test', 'tagalog']) {
      expect(readme, word).toContain(word);
    }
  });
});
