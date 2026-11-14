import type { ReactNode } from 'react';
import { ThemeProvider } from '../../../index';

// Soft, following the OS color mode, with the user's choice remembered.
export function App({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
