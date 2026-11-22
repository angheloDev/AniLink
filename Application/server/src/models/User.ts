import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'farmer' | 'buyer';
  photoUrl?: string;
  phone?: string;
  barangay?: string;
  farm?: { name?: string; description?: string; crops: string[] };
  verification: { status: 'none' | 'pending' | 'verified'; idPhotoUrl?: string; farmPhotoUrl?: string };
  ratingAvg: number;
  ratingCount: number;
  language: 'en' | 'tl';
  blocked: Types.ObjectId[];
  onboarded: boolean;
  createdAt: Date;
}

const schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: String,
    role: { type: String, enum: ['farmer', 'buyer'], default: 'buyer' },
    photoUrl: String,
    phone: String,
    barangay: String,
    farm: { name: String, description: String, crops: { type: [String], default: [] } },
    verification: {
      status: { type: String, enum: ['none', 'pending', 'verified'], default: 'none' },
      idPhotoUrl: String,
      farmPhotoUrl: String,
    },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    language: { type: String, enum: ['en', 'tl'], default: 'en' },
    blocked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', schema);
export type UserDoc = HydratedDocument<IUser>;

export function toUserDTO(u: UserDoc) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    photoUrl: u.photoUrl ?? null,
    phone: u.phone ?? null,
    barangay: u.barangay ?? null,
    farm: u.farm ? { name: u.farm.name ?? '', description: u.farm.description ?? '', crops: u.farm.crops ?? [] } : null,
    verification: { status: u.verification?.status ?? 'none' },
    ratingAvg: u.ratingAvg,
    ratingCount: u.ratingCount,
    language: u.language,
    onboarded: u.onboarded,
    createdAt: u.createdAt,
  };
}
