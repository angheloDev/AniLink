import 'dotenv/config';

export const config = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URL: process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/anilink',
  JWT_SECRET: process.env.JWT_SECRET ?? 'anilink-dev-secret',
  VERIFY_DELAY_MS: Number(process.env.VERIFY_DELAY_MS ?? 30000),
};
