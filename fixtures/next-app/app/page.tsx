import { Box, Icon } from '@adeebali/design-system-react';
import { Search } from 'lucide-react';
import { PortalProbe } from './PortalProbe';

// A server page: this verifies server rendering of a server component, and of a
// client component imported beside it.
export default function Page() {
  return (
    <>
      <Box data-testid="stub">
        Next fixture <Icon icon={Search} data-testid="icon" />
      </Box>
      <PortalProbe />
    </>
  );
}
