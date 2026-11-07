import type { ReactNode } from 'react';
import { Box, type BoxProps } from '../components/Box';

/** A placeholder block for layout stories. */
export function Tile({
  children = 'Item',
  ...props
}: BoxProps & { children?: ReactNode }) {
  return (
    <Box background="muted" borderRadius="md" padding="3" {...props}>
      {children}
    </Box>
  );
}
