import { Schema, model, type Types } from 'mongoose';

export interface IAlert {
  userId: Types.ObjectId;
  crop: string;
  maxPrice?: number;
  barangay?: string;
  createdAt: Date;
}

const schema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    crop: { type: String, required: true, trim: true },
    maxPrice: Number,
    barangay: String,
  },
  { timestamps: true },
);

export const Alert = model<IAlert>('Alert', schema);

export interface IReport {
  reporterId: Types.ObjectId;
  targetType: 'user' | 'listing';
  targetId: string;
  reason: string;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'listing'], required: true },
    targetId: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true },
);

export const ReportModel = model<IReport>('Report', reportSchema);
