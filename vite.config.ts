import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { baseUiEntryPoints } from './baseUiEntryPoints.ts';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  // Compiled styles import these at runtime. Listing them stops Vite reloading
  // mid-test when it discovers them with an empty cache, as in CI.
  optimizeDeps: {
    include: [
      '@vanilla-extract/sprinkles/createRuntimeSprinkles',
      '@vanilla-extract/recipes/createRuntimeFn',
      ...baseUiEntryPoints(fileURLToPath(new URL('./src', import.meta.url))),
    ],
  },
});
