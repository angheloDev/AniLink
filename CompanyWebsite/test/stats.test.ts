import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STATS } from '../src/content/stats';
import { LANGUAGES } from '../src/lib/i18n';

const appRoot = resolve(import.meta.dirname, '../../Application/mobile');

describe('stat tiles only claim true facts', () => {
  it('barangays equals the number of barangays in the app', () => {
    const list = JSON.parse(readFileSync(resolve(appRoot, 'src/data/barangays.json'), 'utf8')) as unknown[];
    expect(STATS.barangays).toBe(list.length);
  });

  it('categories equals the number of categories in the app', () => {
    const src = readFileSync(resolve(appRoot, 'src/theme/tokens.ts'), 'utf8');
    const body = src.match(/CATEGORY_EMOJI: Record<string, string> = \{([\s\S]*?)\};/)?.[1] ?? '';
    const keys = body.match(/^\s*\w+:/gm) ?? [];
    expect(keys.length).toBeGreaterThan(0);
    expect(STATS.categories).toBe(keys.length);
  });

  it('languages equals the languages the site actually offers', () => {
    expect(STATS.languages).toBe(LANGUAGES.length);
    expect(LANGUAGES).toEqual(['en', 'tl']);
  });
});
