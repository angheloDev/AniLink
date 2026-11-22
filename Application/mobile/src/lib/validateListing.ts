import type { Category, ListingInput, Unit } from '../api/types';
import { isValidIsoDate } from './dates';

export interface ListingFormValues {
  title: string;
  description: string;
  category: Category | '';
  price: string;
  unit: Unit;
  stock: string;
  minOrder: string;
  harvestDate: string;
  preorder: boolean;
  negotiable: boolean;
  pickup: boolean;
  delivery: boolean;
  barangay: string | null;
  photos: string[];
}

export type ListingErrors = Partial<Record<'title' | 'category' | 'price' | 'stock' | 'minOrder' | 'harvestDate' | 'fulfil' | 'barangay', string>>;

export function emptyListingForm(): ListingFormValues {
  return {
    title: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    stock: '',
    minOrder: '1',
    harvestDate: '',
    preorder: false,
    negotiable: true,
    pickup: true,
    delivery: false,
    barangay: null,
    photos: [],
  };
}

const num = (s: string): number => (s.trim() === '' ? NaN : Number(s.replace(/,/g, '')));

/** Returns i18n keys for each invalid field (empty object = valid). */
export function validateListing(v: ListingFormValues): ListingErrors {
  const e: ListingErrors = {};
  if (v.title.trim().length < 3) e.title = 'sell.errTitle';
  if (!v.category) e.category = 'sell.errCategory';
  const price = num(v.price);
  if (!(price > 0)) e.price = 'sell.errPrice';
  const stock = num(v.stock);
  if (!(stock >= 1)) e.stock = 'sell.errStock';
  const min = v.minOrder.trim() === '' ? 1 : num(v.minOrder);
  if (!(min >= 1) || (stock >= 1 && min > stock)) e.minOrder = 'sell.errMinOrder';
  if (!v.pickup && !v.delivery) e.fulfil = 'sell.errFulfil';
  if (!v.barangay) e.barangay = 'auth.errRequired';
  if (v.preorder && !isValidIsoDate(v.harvestDate)) e.harvestDate = 'sell.errHarvest';
  return e;
}

export function toListingInput(v: ListingFormValues): ListingInput {
  const min = v.minOrder.trim() === '' ? 1 : num(v.minOrder);
  const input: ListingInput = {
    title: v.title.trim(),
    description: v.description.trim(),
    category: v.category as Category,
    price: num(v.price),
    unit: v.unit,
    stock: num(v.stock),
    minOrder: min,
    preorder: v.preorder,
    negotiable: v.negotiable,
    pickup: v.pickup,
    delivery: v.delivery,
    barangay: v.barangay as string,
    photos: v.photos,
  };
  if (v.harvestDate.trim()) input.harvestDate = v.harvestDate.trim();
  return input;
}
