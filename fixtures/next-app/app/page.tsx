import { Box, Icon, Link, Stack, Text } from '@adeebali/design-system-react';
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
      <PortalProbe />
    </>
  );
}
