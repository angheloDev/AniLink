import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const ORDER_STATUSES = ['pending_payment', 'paid', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IOrder {
  listingId: Types.ObjectId;
  offerId?: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  title: string;
  unit: string;
  photo?: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  delivery: 'pickup' | 'delivery';
  date: string;
  paymentMethod?: 'ewallet_a' | 'ewallet_b' | 'bank' | 'cash';
  paymentRef?: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: Date }[];
  createdAt: Date;
}

const schema = new Schema<IOrder>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    unit: { type: String, required: true },
    photo: String,
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    total: { type: Number, required: true },
    delivery: { type: String, enum: ['pickup', 'delivery'], required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, enum: ['ewallet_a', 'ewallet_b', 'bank', 'cash'] },
    paymentRef: String,
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment' },
    history: [{ _id: false, status: { type: String, enum: ORDER_STATUSES }, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);

export const Order = model<IOrder>('Order', schema);
export type OrderDoc = HydratedDocument<IOrder>;
