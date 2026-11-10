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
  build: {
    rolldownOptions: {
      output: {
        // Split vendors by package, as an app would, so no chunk passes Vite's
        // 500 kB warning. The fixture checks the library's code, not one bundle.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: 'design-system',
              test: /node_modules[\\/](@adeebali|@base-ui|@floating-ui)[\\/]/,
            },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
});
