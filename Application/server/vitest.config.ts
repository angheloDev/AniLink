import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
    env: {
      MONGO_URL: 'mongodb://127.0.0.1:27017/anilink_test',
      JWT_SECRET: 'test-secret',
      VERIFY_DELAY_MS: '50',
    },
  },
});
