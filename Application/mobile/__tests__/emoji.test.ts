import { emojiFor } from '../src/lib/emoji';

describe('emojiFor', () => {
  it('matches common produce by name, ignoring case and spelling variants', () => {
    expect(emojiFor('Baguio Tomatoes', 'vegetables')).toBe('🍅');
    expect(emojiFor('Carabao MANGOES', 'fruits')).toBe('🥭');
    expect(emojiFor('Lakatan Bananas', 'fruits')).toBe('🍌');
    expect(emojiFor('Saba Bananas', 'fruits')).toBe('🍌');
    expect(emojiFor('Native Eggplant (Talong)', 'vegetables')).toBe('🍆');
    expect(emojiFor('Fresh Pechay', 'leafy')).toBe('🥬');
    expect(emojiFor('Fresh Coconut', 'others')).toBe('🥥');
    expect(emojiFor('Camote (Sweet Potato)', 'rootcrops')).toBe('🍠');
  });

  it('prefers the specific product over a generic word (vinegar is not a coconut)', () => {
    expect(emojiFor('Coconut Vinegar 1L', 'others')).not.toBe('🥥');
  });

  it('falls back to the category emoji for unknown items', () => {
    expect(emojiFor('Mystery thing', 'fruits')).toBe('🥭');
    expect(emojiFor('Mystery thing', 'crafts')).toBe('🧺');
    expect(emojiFor('Mystery thing', 'unknown-category')).toBe('🌱');
  });
});
