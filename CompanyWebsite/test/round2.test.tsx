import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Eyebrow } from '../src/components/Eyebrow';
import { Footer } from '../src/components/Footer';
import { HowItWorks } from '../src/components/HowItWorks';
import { renderWithProviders } from './utils';

describe('section labels', () => {
  it('have no dash or rule drawn before the text', () => {
    const { container } = renderWithProviders(<Eyebrow>Gawang lokal</Eyebrow>);
    expect(container.querySelector('span')).toBeNull();
    expect(container.textContent).toBe('Gawang lokal');
  });
});

describe('footer contact', () => {
  it('shows anilink@gmail.com as the email, as a mailto link', () => {
    renderWithProviders(<Footer />);
    const link = screen.getByRole('link', { name: /anilink@gmail\.com/ });
    expect(link).toHaveAttribute('href', 'mailto:anilink@gmail.com');
    expect(document.body.textContent).not.toContain('hello@anilink.example');
  });
});

describe('how it works steps', () => {
  it.each(['buyers', 'farmers'] as const)('show no step numbers for %s', async (who) => {
    renderWithProviders(<HowItWorks />);
    if (who === 'farmers') await userEvent.setup().click(screen.getByRole('button', { name: 'For farmers' }));
    const list = screen.getByRole('list');
    expect(list.textContent).not.toMatch(/(^|[^\d])0[1-4]([^\d]|$)/);
    expect(list.querySelectorAll('li')).toHaveLength(4);
  });
});

describe('no drawn emoji art anywhere in the site source', () => {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(f)) files.push(p);
    }
  };
  walk(resolve(import.meta.dirname, '../src'));
  it('has no emoji characters in any component, lib or content file', () => {
    // The copyright and registered signs count as pictographs in Unicode but are plain text, so they are allowed.
    const offenders = files.filter((f) => /\p{Extended_Pictographic}/u.test(readFileSync(f, 'utf8').replace(/[©®]/g, '')));
    expect(offenders.map((f) => f.replace(/^.*src[\/]/, ''))).toEqual([]);
  });
});
