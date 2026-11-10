import {
  Badge,
  Box,
  Card,
  Icon,
  Link,
  Prose,
  Stack,
  Select,
  Stat,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  Text,
} from '@adeebali/design-system-react';
import { Search } from 'lucide-react';
import { PortalProbe } from './PortalProbe';

// A server page: this verifies server rendering of a server component, and of a
// client component imported beside it.
const plans = [
  { value: 'monthly', label: 'Monthly' },
  { label: 'Longer', options: [{ value: 'annual', label: 'Annual' }] },
];

export default function Page() {
  return (
    <>
      <Box data-testid="stub">
        Next fixture <Icon icon={Search} data-testid="icon" />{' '}
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
      {/* Options built in a server component reach a client Select (Spec 09). */}
      <Select
        data-testid="server-select"
        aria-label="Plan"
        options={plans}
        defaultValue="annual"
      />
      <PortalProbe />
      {/* Tabs rendered from a server component, with server-rendered panels. */}
      <Tabs defaultValue="overview">
        <TabsList aria-label="Views">
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
        </TabsList>
        <TabsPanel value="overview">
          Overview panel, rendered on the server
        </TabsPanel>
        <TabsPanel value="activity">Activity panel</TabsPanel>
      </Tabs>
      <Prose data-testid="prose">
        <p>Prose in a server page.</p>
      </Prose>
    </>
  );
}
