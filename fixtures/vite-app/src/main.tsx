import '@adeebali/design-system-react/styles.css';
import {
  Box,
  Icon,
  Link,
  Stack,
  Text,
  ThemeProvider,
} from '@adeebali/design-system-react';
import { Search } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { PortalProbe } from './PortalProbe';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <Box data-testid="stub">
      Vite fixture <Icon icon={Search} data-testid="icon" />
    </Box>
    <Stack data-testid="layout">
      <Text data-testid="text" size="lg">
        Text
      </Text>
      <Link href="https://example.com" external data-testid="link">
        Docs
      </Link>
    </Stack>
    <PortalProbe />
  </ThemeProvider>,
);
