import '@adeebali/design-system-react/styles.css';
import {
  ColorModeScript,
  ColorModeToggle,
  ThemeProvider,
  ToastProvider,
} from '@adeebali/design-system-react';
import type { ReactNode } from 'react';
import { SiteNav } from './SiteNav';
import { theme } from '../theme';

export const metadata = { title: 'Next fixture' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript />
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <ColorModeToggle />
            <SiteNav />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
