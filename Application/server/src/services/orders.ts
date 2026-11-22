import { HttpError } from '../http';
import { Offer } from '../models/Chat';
import { Listing } from '../models/Listing';
import { Order, type OrderDoc, type OrderStatus } from '../models/Order';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { emitToUsers } from './realtime';

export function nextStatuses(o: { status: OrderStatus; delivery: 'pickup' | 'delivery' }): OrderStatus[] {
  switch (o.status) {
    case 'paid':
      return ['preparing'];
    case 'preparing':
      return [o.delivery === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup'];
    case 'ready_for_pickup':
    case 'out_for_delivery':
      return ['completed'];
    default:
      return [];
  }
}

export async function createOrderFromOffer(offerId: string): Promise<OrderDoc> {
  const offer = await Offer.findById(offerId);
  if (!offer) throw new HttpError(404, 'Offer not found');
  // Atomic stock claim: fails (null) when stock is no longer enough.
  const listing = await Listing.findOneAndUpdate(
    { _id: offer.listingId, stock: { $gte: offer.quantity }, status: 'active' },
    { $inc: { stock: -offer.quantity } },
    { new: true },
  );
  if (!listing) throw new HttpError(422, 'Not enough stock left for this offer');
  if (listing.stock === 0) await Listing.updateOne({ _id: listing._id }, { status: 'soldout' });
  const conv = await import('../models/Chat').then((m) => m.Conversation.findById(offer.conversationId));
  const order = await Order.create({
    listingId: listing._id,
    offerId: offer._id,
    buyerId: conv!.buyerId,
    sellerId: conv!.sellerId,
    title: listing.title,
    unit: listing.unit,
    photo: listing.photos[0],
    quantity: offer.quantity,
    pricePerUnit: offer.pricePerUnit,
    total: Math.round(offer.quantity * offer.pricePerUnit * 100) / 100,
    delivery: offer.delivery,
    date: offer.date,
    status: 'pending_payment',
    history: [{ status: 'pending_payment', at: new Date() }],
  });
  emitToUsers([String(order.buyerId), String(order.sellerId)], 'order:update', { order: await toOrderDTO(order) });
  return order;
}

export async function toOrderDTO(o: OrderDoc) {
  const [buyer, seller, reviewed] = await Promise.all([User.findById(o.buyerId), User.findById(o.sellerId), Review.exists({ orderId: o._id })]);
  const party = (u: typeof buyer, id: unknown) => ({ id: String(id), name: u?.name ?? 'Unknown', photoUrl: u?.photoUrl ?? null, verified: u?.verification?.status === 'verified' });
  return {
    id: String(o._id),
    listingId: String(o.listingId),
    title: o.title,
    unit: o.unit,
    photo: o.photo ?? null,
    quantity: o.quantity,
    pricePerUnit: o.pricePerUnit,
    total: o.total,
    delivery: o.delivery,
    date: o.date,
    paymentMethod: o.paymentMethod ?? null,
    paymentRef: o.paymentRef ?? null,
    status: o.status,
    nextStatuses: nextStatuses(o),
    history: o.history.map((h) => ({ status: h.status, at: h.at })),
    reviewed: !!reviewed,
    buyer: party(buyer, o.buyerId),
    seller: party(seller, o.sellerId),
    createdAt: o.createdAt,
  };
}
