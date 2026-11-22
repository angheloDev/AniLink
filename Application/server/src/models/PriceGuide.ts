import { Schema, model } from 'mongoose';

export interface IPriceGuide {
  crop: string;
  category: string;
  unit: string;
  low: number;
  avg: number;
  high: number;
  trend: number[];
}

const schema = new Schema<IPriceGuide>({
  crop: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  low: Number,
  avg: Number,
  high: Number,
  trend: { type: [Number], default: [] },
});

export const PriceGuide = model<IPriceGuide>('PriceGuide', schema);
