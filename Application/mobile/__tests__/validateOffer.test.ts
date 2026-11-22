import { offerTotal, validateOffer } from '../src/lib/validateOffer';

const listing = { price: 82, stock: 100, minOrder: 5, negotiable: true };

describe('validateOffer', () => {
  it('accepts an offer within stock and above the minimum', () => {
    expect(validateOffer({ pricePerUnit: 70, quantity: 10 }, listing)).toBeNull();
    expect(validateOffer({ pricePerUnit: 70, quantity: 100 }, listing)).toBeNull();
    expect(validateOffer({ pricePerUnit: 70, quantity: 5 }, listing)).toBeNull();
  });

  it('rejects a quantity above the available stock and says how many are left', () => {
    expect(validateOffer({ pricePerUnit: 70, quantity: 101 }, listing)).toEqual({ key: 'offer.errAboveStock', n: 100 });
  });

  it('rejects a quantity below the minimum order', () => {
    expect(validateOffer({ pricePerUnit: 70, quantity: 4 }, listing)).toEqual({ key: 'offer.errBelowMin', n: 5 });
  });

  it('rejects a different price on a fixed-price listing, but allows the listed price', () => {
    const fixed = { ...listing, negotiable: false };
    expect(validateOffer({ pricePerUnit: 70, quantity: 10 }, fixed)).toEqual({ key: 'offer.errFixed' });
    expect(validateOffer({ pricePerUnit: 82, quantity: 10 }, fixed)).toBeNull();
  });

  it('rejects zero, negative and non-numeric values', () => {
    for (const bad of [0, -1, NaN]) {
      expect(validateOffer({ pricePerUnit: bad, quantity: 10 }, listing)).toEqual({ key: 'offer.errPositive' });
      expect(validateOffer({ pricePerUnit: 70, quantity: bad }, listing)).toEqual({ key: 'offer.errPositive' });
    }
  });
});

describe('offerTotal', () => {
  it('multiplies and rounds to centavos', () => {
    expect(offerTotal(82, 10)).toBe(820);
    expect(offerTotal(33.33, 3)).toBe(99.99);
    expect(offerTotal(0.1, 3)).toBe(0.3);
  });
});
