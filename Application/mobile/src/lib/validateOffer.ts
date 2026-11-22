export interface OfferTermsNumbers {
  pricePerUnit: number;
  quantity: number;
}

export interface ListingLimits {
  price: number;
  stock: number;
  minOrder: number;
  negotiable: boolean;
}

export type OfferError = { key: string; n?: number };

/** Mirrors the server rules so the buyer sees the problem before sending. Returns null when valid. */
export function validateOffer(o: OfferTermsNumbers, l: ListingLimits): OfferError | null {
  if (!(o.pricePerUnit > 0) || !(o.quantity > 0)) return { key: 'offer.errPositive' };
  if (o.quantity > l.stock) return { key: 'offer.errAboveStock', n: l.stock };
  if (o.quantity < l.minOrder) return { key: 'offer.errBelowMin', n: l.minOrder };
  if (!l.negotiable && o.pricePerUnit !== l.price) return { key: 'offer.errFixed' };
  return null;
}

export function offerTotal(pricePerUnit: number, quantity: number): number {
  return Math.round(pricePerUnit * quantity * 100) / 100;
}
