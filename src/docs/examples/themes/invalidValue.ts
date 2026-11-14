import { defineTheme } from '../../../index';

// A value from user input that tries to close the CSS rule. defineTheme
// throws, so it never reaches the style element.
export function themeFromInput(accent: string) {
  try {
    return defineTheme({ light: { color: { bg: { accent } } } });
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

themeFromInput('red; } body { display: none');
// Error: Invalid theme value for light.color.bg.accent: "red; } body { display: none". …
