import { CATEGORIES, type Category, type ListingFilters } from '../api/types';

const SORTS: NonNullable<ListingFilters['sort']>[] = ['newest', 'price_asc', 'price_desc', 'nearest', 'rating'];

/** How many advanced filters are on (category and sort have their own controls, so they are not counted). */
export function countActiveFilters(f: ListingFilters): number {
  let n = 0;
  if (f.minPrice != null) n++;
  if (f.maxPrice != null) n++;
  if (f.barangay) n++;
  if (f.verifiedOnly) n++;
  if (f.preorder) n++;
  if (f.delivery) n++;
  return n;
}

/** Route params (always strings) -> filters. Unknown values are dropped. */
export function filtersToParams(p: Record<string, string | string[] | undefined>): Partial<ListingFilters> {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const out: Partial<ListingFilters> = {};
  const category = one(p.category);
  if (category && (CATEGORIES as string[]).includes(category)) out.category = category as Category;
  const sort = one(p.sort);
  if (sort && (SORTS as string[]).includes(sort)) out.sort = sort as ListingFilters['sort'];
  if (one(p.preorder) === '1') out.preorder = true;
  if (one(p.delivery) === '1') out.delivery = true;
  if (one(p.verifiedOnly) === '1') out.verifiedOnly = true;
  const q = one(p.q);
  if (q) out.q = q;
  return out;
}
