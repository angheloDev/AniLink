/// <reference types="node" />
import fs from 'fs';
import path from 'path';

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.tsx?$/.test(e.name) && !e.name.includes('leaflet-embed') ? [p] : [];
  });
}

/**
 * React Native already un-flips the empty, header and footer components of an inverted list
 * (on Android it uses scale: -1). Flipping them again by hand mirrors the text, e.g. "Say hello" reads backwards.
 */
describe('inverted lists', () => {
  const files = sourceFiles(path.join(__dirname, '..', 'src')).filter((f) => /\binverted\b/.test(fs.readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '')));

  it('exist in the app (so this check is not vacuous)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => path.relative(path.join(__dirname, '..'), f)))('%s does not flip its own content', (file) => {
    const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    expect(src).not.toMatch(/scale(X|Y)?\s*:\s*-/);
  });
});
