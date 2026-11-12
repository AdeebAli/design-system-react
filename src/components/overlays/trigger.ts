import type { ComponentPropsWithRef, ReactElement } from 'react';

/**
 * Props for every overlay trigger part. The one child is passed straight to
 * Base UI's `render`, so there is no `Children.only` or `isValidElement`: a
 * server-built child can arrive as a lazy wrapper that fails those checks.
 */
export type OverlayTriggerProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children'
> & { children: ReactElement };
