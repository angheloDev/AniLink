import mongoose from 'mongoose';
import { config } from './config';

export async function connect(url: string = config.MONGO_URL): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(url);
}

export async function disconnect(): Promise<void> {
  await mongoose.disconnect();
}
