import mongoose from 'mongoose';
import { connect, disconnect } from '../src/db';

export async function setupDb(): Promise<void> {
  await connect();
}

export async function resetDb(): Promise<void> {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export async function teardownDb(): Promise<void> {
  await disconnect();
}
