import { Schema, model, type Types } from 'mongoose';

export interface IReview {
  orderId: Types.ObjectId;
  listingId: Types.ObjectId;
  sellerId: Types.ObjectId;
  buyerId: Types.ObjectId;
  rating: number;
  text: string;
  createdAt: Date;
}

const schema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Review = model<IReview>('Review', schema);
