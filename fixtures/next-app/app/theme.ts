import { defineTheme } from '@adeebali/design-system-react';

export const theme = defineTheme({
  shared: { font: { family: { mono: '"Fixture Mono", monospace' } } },
  light: { color: { bg: { accent: '#0f766e' } } },
  dark: { color: { bg: { accent: '#2dd4bf' } } },
});
