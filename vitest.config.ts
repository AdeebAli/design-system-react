import { defineConfig, mergeConfig } from 'vitest/config';
import shared from './vite.config.ts';

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      typecheck: { include: ['src/**/*.test-d.{ts,tsx}'] },
    },
  }),
);
