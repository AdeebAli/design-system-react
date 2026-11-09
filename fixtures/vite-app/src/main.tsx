import '@adeebali/design-system-react/styles.css';
import {
  Badge,
  Box,
  Card,
  ColorModeToggle,
  Icon,
  Link,
  NavBar,
  NavBarLink,
  Prose,
  Stack,
  Stat,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
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
    <NavBar aria-label="Main">
      <NavBarLink href="/" active>
        Home
      </NavBarLink>
      <NavBarLink href="#blog">Blog</NavBarLink>
    </NavBar>
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
    <Tabs defaultValue="overview">
      <TabsList aria-label="Views">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
      </TabsList>
      <TabsPanel value="overview">Overview panel</TabsPanel>
      <TabsPanel value="activity">Activity panel</TabsPanel>
    </Tabs>
    <Prose data-testid="prose">
      <p>Prose in the Vite app.</p>
    </Prose>
  </ThemeProvider>,
);
