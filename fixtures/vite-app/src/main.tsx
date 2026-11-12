import '@adeebali/design-system-react/styles.css';
import {
  Badge,
  Box,
  Button,
  Card,
  ColorModeToggle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Icon,
  Link,
  NavBar,
  NavBarLink,
  Prose,
  Stack,
  Stat,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
    <Dialog>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>Fixture dialog</DialogTitle>
        <DialogDescription>Rendered from the packed tarball.</DialogDescription>
        <DialogClose>
          <Button variant="soft">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
    <Table aria-label="Plans" data-testid="table">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Plan</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeader scope="row">Ada Park</TableHeader>
          <TableCell>Pro</TableCell>
        </TableRow>
        <TableRow>
          <TableHeader scope="row">Grace Lin</TableHeader>
          <TableCell>Team</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Prose data-testid="prose">
      <p>Prose in the Vite app.</p>
    </Prose>
  </ThemeProvider>,
);
