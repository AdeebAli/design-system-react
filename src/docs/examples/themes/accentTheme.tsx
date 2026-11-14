import type { ReactNode } from 'react';
import { defineTheme, ThemeProvider } from '../../../index';

// A teal accent. The accent's hover, subtle background, and text on it are
// separate tokens, so they change together.
export const tealTheme = defineTheme({
  shared: { radius: { control: '8px' } },
  light: {
    color: {
      bg: { accent: '#0f766e', accentHover: '#115e59', accentSubtle: '#e6f4f1' },
      fg: { onAccent: '#ffffff' },
    },
  },
  dark: {
    color: {
      bg: { accent: '#2dd4bf', accentHover: '#5eead4', accentSubtle: '#132a27' },
      fg: { onAccent: '#0b1f1c' },
    },
  },
});

export function App({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={tealTheme}>{children}</ThemeProvider>;
}
