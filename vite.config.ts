import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  // Compiled styles import these at runtime. Listing them stops Vite reloading
  // mid-test when it discovers them with an empty cache, as in CI.
  optimizeDeps: {
    include: [
      '@vanilla-extract/sprinkles/createRuntimeSprinkles',
      '@vanilla-extract/recipes/createRuntimeFn',
      '@base-ui/react/accordion',
      '@base-ui/react/alert-dialog',
      '@base-ui/react/avatar',
      '@base-ui/react/button',
      '@base-ui/react/checkbox',
      '@base-ui/react/collapsible',
      '@base-ui/react/combobox',
      '@base-ui/react/dialog',
      '@base-ui/react/direction-provider',
      '@base-ui/react/drawer',
      '@base-ui/react/field',
      '@base-ui/react/menu',
      '@base-ui/react/popover',
      '@base-ui/react/progress',
      '@base-ui/react/radio',
      '@base-ui/react/radio-group',
      '@base-ui/react/select',
      '@base-ui/react/switch',
      '@base-ui/react/tabs',
      '@base-ui/react/toast',
      '@base-ui/react/toggle',
      '@base-ui/react/toggle-group',
      '@base-ui/react/tooltip',
    ],
  },
});
