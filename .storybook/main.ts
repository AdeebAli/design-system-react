import type { StorybookConfig } from '@storybook/react-vite';
import { exampleSource } from '../src/docs/exampleSource';
import remarkGfm from 'remark-gfm';

const LAYOUT_COMPONENTS = new Set([
  'Box',
  'Flex',
  'Stack',
  'Inline',
  'Grid',
  'Container',
  'Center',
  'Inset',
]);

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  typescript: {
    // Spec 18: props tables come from this package's TSDoc.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      shouldExtractValuesFromUnion: true,
      propFilter: (prop, component) => {
        const declarations = prop.declarations ?? [];
        const own = declarations.some(
          (d) =>
            d.fileName.includes('/src/') &&
            !d.fileName.includes('/node_modules/'),
        );
        if (!own) return false;
        // Layout props show only on the layout components; other pages link
        // to the style props page (Spec 18, Props tables).
        const layoutOnly = declarations.every(
          (d) =>
            d.name === 'LayoutProps' &&
            d.fileName.endsWith('/src/components/Box/types.ts'),
        );
        return !layoutOnly || LAYOUT_COMPONENTS.has(component.name);
      },
    },
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [exampleSource(), ...(viteConfig.plugins ?? [])],
  }),
  addons: [
    {
      name: '@storybook/addon-docs',
      // MDX doesn't include GitHub-flavored Markdown, so tables need remark-gfm.
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
};

export default config;
