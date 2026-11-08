import { getColorModeScript } from '@adeebali/design-system-react';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
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
