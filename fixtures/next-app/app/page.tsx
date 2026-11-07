import { Box, ClientProbe } from '@adeebali/design-system-react';

// A server page: this verifies the "use client" split and server rendering.
export default function Page() {
  return (
    <Box data-testid="stub">
      Next fixture
      <ClientProbe />
    </Box>
  );
}
