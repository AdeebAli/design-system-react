import '@adeebali/design-system-react/styles.css';
import { Box } from '@adeebali/design-system-react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <Box data-testid="stub">Vite fixture</Box>,
);
