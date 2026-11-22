import { addDays, isValidIsoDate, todayIso } from '../src/lib/dates';
import { emptyListingForm, toListingInput, validateListing, type ListingFormValues } from '../src/lib/validateListing';

const valid: ListingFormValues = {
  ...emptyListingForm(),
  title: 'Baguio Tomatoes',
  category: 'vegetables',
  price: '82',
  unit: 'kg',
  stock: '140',
  minOrder: '1',
  barangay: 'Tumaga',
  pickup: true,
};

describe('validateListing', () => {
  it('flags every required field on an empty form', () => {
    const e = validateListing(emptyListingForm());
    expect(Object.keys(e).sort()).toEqual(['barangay', 'category', 'price', 'stock', 'title']);
  });

  it('accepts a valid listing', () => {
    expect(validateListing(valid)).toEqual({});
  });

  it('rejects a title shorter than 3 characters', () => {
    expect(validateListing({ ...valid, title: ' ab ' }).title).toBe('sell.errTitle');
  });

  it('rejects a zero, negative or non-numeric price', () => {
    for (const price of ['0', '-5', 'abc', '']) expect(validateListing({ ...valid, price }).price).toBe('sell.errPrice');
    expect(validateListing({ ...valid, price: '82.50' }).price).toBeUndefined();
  });

  it('rejects stock below 1', () => {
    expect(validateListing({ ...valid, stock: '0' }).stock).toBe('sell.errStock');
    expect(validateListing({ ...valid, stock: '' }).stock).toBe('sell.errStock');
  });

  it('requires pickup, delivery or both', () => {
    expect(validateListing({ ...valid, pickup: false, delivery: false }).fulfil).toBe('sell.errFulfil');
    expect(validateListing({ ...valid, pickup: false, delivery: true }).fulfil).toBeUndefined();
  });

  it('rejects a minimum order above the available stock', () => {
    expect(validateListing({ ...valid, stock: '10', minOrder: '20' }).minOrder).toBe('sell.errMinOrder');
  });

  it('requires a valid harvest date for pre-orders', () => {
    expect(validateListing({ ...valid, preorder: true, harvestDate: '' }).harvestDate).toBe('sell.errHarvest');
    expect(validateListing({ ...valid, preorder: true, harvestDate: '2026-13-45' }).harvestDate).toBe('sell.errHarvest');
    expect(validateListing({ ...valid, preorder: true, harvestDate: addDays(todayIso(), 5) }).harvestDate).toBeUndefined();
  });
});

describe('toListingInput', () => {
  it('converts text fields to numbers, trims, and omits an empty harvest date', () => {
    const input = toListingInput({ ...valid, title: '  Baguio Tomatoes ', price: '82.50', stock: '140', minOrder: '' });
    expect(input).toMatchObject({ title: 'Baguio Tomatoes', price: 82.5, stock: 140, minOrder: 1, barangay: 'Tumaga', pickup: true });
    expect('harvestDate' in input).toBe(false);
  });

  it('keeps a harvest date when set', () => {
    expect(toListingInput({ ...valid, harvestDate: '2026-12-01' }).harvestDate).toBe('2026-12-01');
  });
});

describe('dates', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-11-29', 3)).toBe('2026-12-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('validates calendar dates strictly', () => {
    expect(isValidIsoDate('2026-02-28')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
    expect(isValidIsoDate('12/01/2026')).toBe(false);
    expect(isValidIsoDate('')).toBe(false);
  });

  it('today is a valid ISO date', () => {
    expect(isValidIsoDate(todayIso())).toBe(true);
  });
});
