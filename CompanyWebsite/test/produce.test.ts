import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { filterProduce, PRODUCE, type ProduceCategory } from '../src/lib/produce';

const CATEGORIES: ProduceCategory[] = ['fruits', 'vegetables', 'leafy', 'rootcrops', 'crafts'];

describe('sample produce', () => {
  it('has at least 10 items with unique ids', () => {
    expect(PRODUCE.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PRODUCE.map((p) => p.id)).size).toBe(PRODUCE.length);
  });

  it('covers every category', () => {
    for (const c of CATEGORIES) expect(filterProduce(PRODUCE, c).length, c).toBeGreaterThan(0);
  });

  it('only uses real barangays from the app', () => {
    const file = resolve(import.meta.dirname, '../../Application/mobile/src/data/barangays.json');
    const names = new Set((JSON.parse(readFileSync(file, 'utf8')) as { name: string }[]).map((b) => b.name));
    for (const p of PRODUCE) expect(names.has(p.barangay), `${p.name}: ${p.barangay}`).toBe(true);
  });
});

describe('filterProduce', () => {
  it('"all" returns everything', () => {
    expect(filterProduce(PRODUCE, 'all')).toHaveLength(PRODUCE.length);
  });
  it('a category returns only that category', () => {
    const fruits = filterProduce(PRODUCE, 'fruits');
    expect(fruits.length).toBeGreaterThan(0);
    expect(fruits.every((p) => p.category === 'fruits')).toBe(true);
  });
  it('does not mutate its input', () => {
    const copy = [...PRODUCE];
    filterProduce(PRODUCE, 'leafy');
    expect(PRODUCE).toEqual(copy);
  });
});
