import { defineConfig } from 'vite';
import { getColorModeScript } from '../../../index';

// vite.config.ts: React doesn't run script elements it creates on the client,
// so inject the color mode script into index.html at build time.
export default defineConfig({
  plugins: [
    {
      name: 'color-mode-script',
      transformIndexHtml: () => [
        {
          tag: 'script',
          children: getColorModeScript(),
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
});
