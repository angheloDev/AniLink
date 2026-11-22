import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const tokensSrc = readFileSync(resolve(root, '../Application/mobile/src/theme/tokens.ts'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/theme.css'), 'utf8');

function hexTokens(name: 'dark' | 'light'): Record<string, string> {
  const re = name === 'dark' ? /const dark = \{([\s\S]*?)\};/ : /const light: Colors = \{([\s\S]*?)\};/;
  const body = tokensSrc.match(re)?.[1] ?? '';
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)) out[m[1]] = m[2];
  return out;
}
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
function block(theme: 'dark' | 'light'): string {
  const start = css.indexOf(`:root[data-theme='${theme}']`);
  if (start < 0) return '';
  const open = css.indexOf('{', start);
  return css.slice(open + 1, css.indexOf('}', open));
}

describe('theme tokens', () => {
  for (const theme of ['dark', 'light'] as const) {
    it(`theme.css carries every ${theme} token from the app`, () => {
      const tokens = hexTokens(theme);
      expect(Object.keys(tokens).length).toBeGreaterThan(15);
      const b = block(theme).toLowerCase();
      expect(b.length).toBeGreaterThan(0);
      for (const [key, hex] of Object.entries(tokens)) {
        expect(b, `--${kebab(key)} in ${theme}`).toContain(`--${kebab(key)}: ${hex.toLowerCase()}`);
      }
    });
  }
});

describe('scaffold', () => {
  it('sets the theme in an inline script before the app module loads (no flash)', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    const inline = html.indexOf("localStorage.getItem('anilink.theme')");
    const mod = html.indexOf('/src/main.tsx');
    expect(inline).toBeGreaterThan(-1);
    expect(mod).toBeGreaterThan(inline);
  });

  it('ships the three logos and a favicon', () => {
    for (const f of ['logos/mark.png', 'logos/loading-dark.png', 'logos/loading-light.png', 'favicon.png']) {
      expect(existsSync(resolve(root, 'public', f)), f).toBe(true);
    }
  });
});
