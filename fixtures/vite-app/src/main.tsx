import '@adeebali/design-system-react/styles.css';
import {
  Badge,
  Box,
  Card,
  ColorModeToggle,
  Icon,
  Link,
  Stack,
  Stat,
  Text,
  ThemeProvider,
} from '@adeebali/design-system-react';
import { Search } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { PortalProbe } from './PortalProbe';
import { RhfForm } from './RhfForm';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <ColorModeToggle />
    <Box data-testid="stub">
      Vite fixture <Icon icon={Search} data-testid="icon" />{' '}
      <Icon icon={Search} tone="muted" data-testid="toned-icon" />
    </Box>
    <Stack data-testid="layout">
      <Text data-testid="text" size="lg">
        Text
      </Text>
      <Link href="https://example.com" external data-testid="link">
        Docs
      </Link>
    </Stack>
    <Card data-testid="card">
      <Badge data-testid="badge" tone="accent" variant="solid">
        Pro
      </Badge>
      <Stat label="Revenue" value="$21.4k" change="4.1" trend="up" />
    </Card>
    <RhfForm />
    <PortalProbe />
  </ThemeProvider>,
);
