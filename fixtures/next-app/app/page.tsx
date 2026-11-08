import {
  Badge,
  Box,
  Card,
  Icon,
  Link,
  Stack,
  Stat,
  Text,
} from '@adeebali/design-system-react';
import { Search } from 'lucide-react';
import { PortalProbe } from './PortalProbe';

// A server page: this verifies server rendering of a server component, and of a
// client component imported beside it.
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
      <PortalProbe />
    </>
  );
}
