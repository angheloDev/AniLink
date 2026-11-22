import { MAX_ITEM_LENGTH, MAX_ITEMS, addItems, parseItems, toggleItem } from '../src/lib/items';

describe('parseItems', () => {
  it('splits on commas, semicolons and new lines', () => {
    expect(parseItems('lanzones, durian;ube\nsaging')).toEqual(['Lanzones', 'Durian', 'Ube', 'Saging']);
  });

  it('trims, collapses spaces, drops blanks and repeats, and capitalizes each word', () => {
    expect(parseItems('  dragon   fruit , , DURIAN,durian ')).toEqual(['Dragon Fruit', 'Durian']);
  });

  it('returns nothing for empty input', () => {
    expect(parseItems('')).toEqual([]);
    expect(parseItems(' , ; ')).toEqual([]);
  });

  it('cuts very long names to the maximum length', () => {
    const [name] = parseItems('x'.repeat(80));
    expect(name).toHaveLength(MAX_ITEM_LENGTH);
  });
});

describe('addItems', () => {
  it('adds several new items at once, keeping what was already picked', () => {
    expect(addItems(['Mango'], 'Lanzones, Durian')).toEqual(['Mango', 'Lanzones', 'Durian']);
  });

  it('does not add something already picked, whatever its capitalization', () => {
    expect(addItems(['Mango', 'Durian'], 'mango, DURIAN, Ube')).toEqual(['Mango', 'Durian', 'Ube']);
  });

  it('uses the suggested spelling when the typed text matches a suggestion', () => {
    expect(addItems([], 'tomato', ['Tomato', 'Mango'])).toEqual(['Tomato']);
  });

  it('stops at the maximum number of items', () => {
    const full = Array.from({ length: MAX_ITEMS }, (_, i) => `Item ${i}`);
    expect(addItems(full, 'One More')).toEqual(full);
    expect(addItems(full.slice(0, MAX_ITEMS - 1), 'One, Two')).toHaveLength(MAX_ITEMS);
  });

  it('leaves the list unchanged for empty text', () => {
    const list = ['Mango'];
    expect(addItems(list, '  ')).toEqual(['Mango']);
  });
});

describe('toggleItem', () => {
  it('adds an item that is not picked and removes one that is', () => {
    expect(toggleItem(['Mango'], 'Banana')).toEqual(['Mango', 'Banana']);
    expect(toggleItem(['Mango', 'Banana'], 'Mango')).toEqual(['Banana']);
  });
});
