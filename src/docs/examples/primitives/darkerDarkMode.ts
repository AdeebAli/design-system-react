import { defineTheme, tokens } from '../../../index';

// A theme built from primitives: a darker canvas and surface in dark mode.
// Primitives belong here, in a theme, and nowhere else.
export const darkerDarkMode = defineTheme({
  dark: {
    color: {
      bg: {
        canvas: tokens.neutral[950],
        surface: tokens.neutral[900],
      },
    },
  },
});
