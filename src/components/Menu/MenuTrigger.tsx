'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { OverlayTriggerProps } from '../overlays/trigger';

/** `MenuTrigger`'s props. The one child must render a `button`. */
export type MenuTriggerProps = OverlayTriggerProps;

/** Opens the menu. The child gets the behavior and keeps its own `onClick`. */
export function MenuTrigger({ children, ...props }: MenuTriggerProps) {
  return <BaseMenu.Trigger {...props} render={children} />;
}
