import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IConversation {
  listingId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  lastMessage: string;
  lastAt: Date;
  unread: { buyer: number; seller: number };
}

const conversationSchema = new Schema<IConversation>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lastMessage: { type: String, default: '' },
    lastAt: { type: Date, default: Date.now },
    unread: { buyer: { type: Number, default: 0 }, seller: { type: Number, default: 0 } },
  },
  { timestamps: true },
);
conversationSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
export type ConversationDoc = HydratedDocument<IConversation>;

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: 'text' | 'image' | 'offer' | 'system';
  text?: string;
  imageUrl?: string;
  offerId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  readAt?: Date;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'offer', 'system'], required: true },
    text: String,
    imageUrl: String,
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    readAt: Date,
  },
  { timestamps: true },
);

export const Message = model<IMessage>('Message', messageSchema);
export type MessageDoc = HydratedDocument<IMessage>;

export interface IOffer {
  conversationId: Types.ObjectId;
  listingId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  pricePerUnit: number;
  quantity: number;
  delivery: 'pickup' | 'delivery';
  date: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'superseded';
  orderId?: Types.ObjectId;
  createdAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerUnit: { type: Number, required: true },
    quantity: { type: Number, required: true },
    delivery: { type: String, enum: ['pickup', 'delivery'], required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'countered', 'superseded'], default: 'pending' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true },
);

export const Offer = model<IOffer>('Offer', offerSchema);
export type OfferDoc = HydratedDocument<IOffer>;
