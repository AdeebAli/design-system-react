import '@adeebali/design-system-react/styles.css';
import {
  ColorModeScript,
  ColorModeToggle,
  ThemeProvider,
} from '@adeebali/design-system-react';
import type { ReactNode } from 'react';
import { theme } from './theme';

export const metadata = { title: 'Next fixture' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript />
        <ThemeProvider theme={theme}>
          <ColorModeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
