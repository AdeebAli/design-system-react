import { defineConfig, devices } from '@playwright/test';

// Visual regression against the built static Storybook (Spec 01).
export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  use: { baseURL: 'http://127.0.0.1:6107' },
  webServer: {
    command:
      'npx vite preview --outDir storybook-static --port 6107 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:6107/index.json',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
