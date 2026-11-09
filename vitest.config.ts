import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from './vite.config.ts';

// Every story runs in both modes, so axe covers light and dark (Spec 01).
function storiesProject(mode: 'light' | 'dark') {
  return mergeConfig(
    shared,
    defineConfig({
      plugins: [storybookTest({ configDir: '.storybook' })],
      define: { __DS_MODE__: JSON.stringify(mode) },
      test: {
        name: `stories-${mode}`,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
        setupFiles: ['.storybook/vitest.setup.ts'],
      },
    }),
  );
}

export default defineConfig({
  test: {
    // The on-disk module cache misses changes to files a .css.ts imports,
    // such as the theme contract, and runs tests against stale styles.
    fsModuleCache: false,
    projects: [
      mergeConfig(
        shared,
        defineConfig({
          test: {
            name: 'unit',
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.ts'],
            include: ['src/**/*.test.{ts,tsx}'],
            exclude: ['src/**/*.browser.test.tsx'],
            typecheck: {
              enabled: true,
              include: ['src/**/*.test-d.{ts,tsx}'],
            },
          },
        }),
      ),
      mergeConfig(
        shared,
        defineConfig({
          test: {
            name: 'browser',
            globals: true,
            include: ['src/**/*.browser.test.tsx'],
            setupFiles: ['./vitest.browser.setup.ts'],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        }),
      ),
      storiesProject('light'),
      storiesProject('dark'),
    ],
  },
});
