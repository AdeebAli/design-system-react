'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import type { OverlayTriggerProps } from '../overlays/trigger';

/** `PopoverTrigger`'s props. The one child must render a `button`. */
export type PopoverTriggerProps = OverlayTriggerProps;

/** Opens the popover. The child gets the behavior and keeps its own `onClick`. */
export function PopoverTrigger({ children, ...props }: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} render={children} />;
}
