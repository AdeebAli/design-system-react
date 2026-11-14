import { defineTheme } from '../../../index';

// Replaces the interface font. Your own @font-face rules load "Brand Sans" and
// its fallback face; keep a system font at the end of the stack.
export const brandFont = defineTheme({
  shared: {
    font: {
      family: {
        sans: '"Brand Sans", "Brand Sans Fallback", ui-sans-serif, system-ui, sans-serif',
      },
    },
  },
});
