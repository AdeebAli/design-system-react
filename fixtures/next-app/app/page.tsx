import { Box } from '@adeebali/design-system-react';
import { PortalProbe } from './PortalProbe';

// A server page: this verifies server rendering of a server component, and of a
// client component imported beside it.
export default function Page() {
  return (
    <>
      <Box data-testid="stub">Next fixture</Box>
      <PortalProbe />
    </>
  );
}
