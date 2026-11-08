import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json' with { type: 'json' };
import shared from './vite.config.ts';

const runtimeDependencies = Object.keys(
  (pkg as { dependencies?: Record<string, string> }).dependencies ?? {},
);

function isExternal(id: string) {
  return [
    'react',
    'react-dom',
    'react/jsx-runtime',
    ...runtimeDependencies,
  ].some((name) => id === name || id.startsWith(`${name}/`));
}

export default mergeConfig(
  shared,
  defineConfig({
    plugins: [
      dts({
        bundleTypes: true,
        tsconfigPath: './tsconfig.build.json',
      }),
    ],
    build: {
      cssCodeSplit: false,
      lib: {
        entry: resolve(import.meta.dirname, 'src/index.ts'),
        formats: ['es'],
        cssFileName: 'styles',
      },
      rollupOptions: {
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
  }),
);
