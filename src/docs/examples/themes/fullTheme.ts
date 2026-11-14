import { defineFullTheme, softDark, softLight } from '../../../index';

// Every token, in both modes. Start from Soft and change what you need, so the
// types check that nothing is missing.
export const brandTheme = defineFullTheme({
  light: {
    ...softLight,
    font: {
      ...softLight.font,
      family: { ...softLight.font.family, sans: '"Brand Sans", sans-serif' },
    },
  },
  dark: {
    ...softDark,
    font: {
      ...softDark.font,
      family: { ...softDark.font.family, sans: '"Brand Sans", sans-serif' },
    },
  },
});
