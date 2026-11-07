import { defineConfig, devices } from '@playwright/test';

const reuse = !process.env.CI;

// Serves each built consumer fixture. Run by scripts/test-fixtures.mjs.
export default defineConfig({
  testDir: '.',
  reporter: 'list',
  use: { ...devices['Desktop Chrome'] },
  webServer: [
    {
      command: 'npx vite preview --port 6201 --strictPort --host 127.0.0.1',
      cwd: '../../fixtures/vite-app',
      url: 'http://127.0.0.1:6201',
      reuseExistingServer: reuse,
    },
    {
      command: 'npx next start --port 6202 --hostname 127.0.0.1',
      cwd: '../../fixtures/next-app',
      url: 'http://127.0.0.1:6202',
      reuseExistingServer: reuse,
    },
  ],
  projects: [
    { name: 'vite-app', use: { baseURL: 'http://127.0.0.1:6201' } },
    { name: 'next-app', use: { baseURL: 'http://127.0.0.1:6202' } },
  ],
});
