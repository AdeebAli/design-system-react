'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import type { OverlayTriggerProps } from '../overlays/trigger';

/** `PopoverClose`'s props. The one child must render a `button`. */
export type PopoverCloseProps = OverlayTriggerProps;

/** Closes the popover. The child gets the behavior and keeps its own `onClick`. */
export function PopoverClose({ children, ...props }: PopoverCloseProps) {
  return <BasePopover.Close {...props} render={children} />;
}
