// @storybook/react ships this entry without types. Only the extractor that
// .storybook/preview.tsx wraps is declared.
declare module '@storybook/react/entry-preview-argtypes' {
  import type { StrictArgTypes } from 'storybook/internal/types';

  export const parameters: {
    docs: {
      extractArgTypes: (component: unknown) => StrictArgTypes | null;
    };
  };
}
