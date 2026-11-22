import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const CATEGORIES = ['vegetables', 'fruits', 'leafy', 'rootcrops', 'grains', 'crafts', 'others'] as const;
export const UNITS = ['kg', 'piece', 'tali', 'sack', 'dozen'] as const;

export interface IListing {
  sellerId: Types.ObjectId;
  title: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  price: number;
  unit: (typeof UNITS)[number];
  stock: number;
  minOrder: number;
  harvestDate?: Date;
  preorder: boolean;
  negotiable: boolean;
  pickup: boolean;
  delivery: boolean;
  barangay: string;
  coords: { lat: number; lng: number };
  photos: string[];
  status: 'active' | 'paused' | 'soldout';
  views: number;
  favoritedBy: Types.ObjectId[];
  createdAt: Date;
}

const schema = new Schema<IListing>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    price: { type: Number, required: true },
    unit: { type: String, enum: UNITS, required: true },
    stock: { type: Number, required: true },
    minOrder: { type: Number, default: 1 },
    harvestDate: Date,
    preorder: { type: Boolean, default: false },
    negotiable: { type: Boolean, default: true },
    pickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: false },
    barangay: { type: String, required: true },
    coords: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    photos: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'paused', 'soldout'], default: 'active' },
    views: { type: Number, default: 0 },
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Listing = model<IListing>('Listing', schema);
export type ListingDoc = HydratedDocument<IListing>;
