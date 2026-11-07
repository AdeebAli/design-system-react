import { defineTheme } from '@adeebali/design-system-react';

export const theme = defineTheme({
  shared: {
    font: { family: { mono: '"Fixture Mono", monospace' } },
    // Soft's own value. An override must not turn off reduced motion.
    motion: { duration: { base: '200ms' } },
  },
  light: { color: { bg: { accent: '#0f766e' } } },
  dark: { color: { bg: { accent: '#2dd4bf' } } },
});
