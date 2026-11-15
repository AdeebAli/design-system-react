import '@adeebali/design-system-react/styles.css';
import type { ReactNode } from 'react';
import { ColorModeScript, ThemeProvider } from '../../../index';

// app/layout.tsx: a server component. ColorModeScript runs before first paint,
// so the stored color mode applies with no flash.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
