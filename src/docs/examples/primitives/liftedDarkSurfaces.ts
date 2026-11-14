import { defineTheme, tokens } from '../../../index';

// A theme built from primitives: in dark mode, cards and popups sit one step
// lighter than Soft Dark's, so they stand out more from the canvas. Each
// role keeps its own step: canvas 950, sunken 900, surface 800, raised 775.
// Primitives belong here, in a theme, and nowhere else.
export const liftedDarkSurfaces = defineTheme({
  dark: {
    color: {
      bg: {
        surface: tokens.neutral[800],
        raised: tokens.neutral[775],
      },
    },
  },
});
