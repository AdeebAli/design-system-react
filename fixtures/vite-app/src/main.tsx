import '@adeebali/design-system-react/styles.css';
import { Box, ThemeProvider } from '@adeebali/design-system-react';
import { createRoot } from 'react-dom/client';
import { PortalProbe } from './PortalProbe';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <Box data-testid="stub">Vite fixture</Box>
    <PortalProbe />
  </ThemeProvider>,
);
