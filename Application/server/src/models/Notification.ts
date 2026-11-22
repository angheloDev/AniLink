import { Schema, model, type Types } from 'mongoose';

export interface INotification {
  userId: Types.ObjectId;
  type: 'message' | 'offer' | 'order' | 'verification' | 'alert' | 'price';
  title: string;
  body: string;
  route: string;
  readAt?: Date;
  createdAt: Date;
}

const schema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['message', 'offer', 'order', 'verification', 'alert', 'price'], required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    route: { type: String, default: '/' },
    readAt: Date,
  },
  { timestamps: true },
);

export const Notification = model<INotification>('Notification', schema);
