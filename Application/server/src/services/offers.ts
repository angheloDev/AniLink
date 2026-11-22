import { HttpError } from '../http';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'superseded';

export interface OfferTerms {
  pricePerUnit: number;
  quantity: number;
  delivery: 'pickup' | 'delivery';
  date: string;
}

export interface OfferState extends OfferTerms {
  fromUserId: string;
  toUserId: string;
  status: OfferStatus;
}

export function applyOfferAction(
  offer: OfferState,
  actorId: string,
  action: 'accept' | 'decline' | 'counter',
  counter?: OfferTerms,
): { offer: OfferState; newOffer?: OfferState } {
  if (actorId !== offer.toUserId) throw new HttpError(403, 'Only the recipient can respond to this offer');
  if (offer.status !== 'pending') throw new HttpError(409, 'This offer is no longer pending');
  if (action === 'accept') return { offer: { ...offer, status: 'accepted' } };
  if (action === 'decline') return { offer: { ...offer, status: 'declined' } };
  if (!counter) throw new HttpError(400, 'Counter terms are required');
  return {
    offer: { ...offer, status: 'countered' },
    newOffer: { ...counter, fromUserId: actorId, toUserId: offer.fromUserId, status: 'pending' },
  };
}

export function validateOfferAgainstListing(
  o: { quantity: number; pricePerUnit: number },
  l: { stock: number; minOrder: number; negotiable: boolean; price: number },
): void {
  if (!(o.quantity > 0) || !(o.pricePerUnit > 0)) throw new HttpError(422, 'Quantity and price must be above zero');
  if (o.quantity > l.stock) throw new HttpError(422, `Only ${l.stock} available`);
  if (o.quantity < l.minOrder) throw new HttpError(422, `Minimum order is ${l.minOrder}`);
  if (!l.negotiable && o.pricePerUnit !== l.price) throw new HttpError(422, 'This listing is not negotiable');
}
