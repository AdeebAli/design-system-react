import '@adeebali/design-system-react/styles.css';
import {
  ColorModeScript,
  ColorModeToggle,
  ThemeProvider,
} from '@adeebali/design-system-react';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { SiteNav } from '../(site)/SiteNav';
import { theme } from '../theme';

export const metadata = { title: 'Next fixture under CSP' };

// Its own root layout, so reading the nonce makes only this page dynamic.
export default async function CspLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript nonce={nonce} />
        <ThemeProvider theme={theme} nonce={nonce}>
          <ColorModeToggle />
          <SiteNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
