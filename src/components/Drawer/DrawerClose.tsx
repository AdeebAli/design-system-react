'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { OverlayTriggerProps } from '../overlays/trigger';
import { useDrawerContext, useRegisterPart } from './DrawerContext';

/** `DrawerClose`'s props. The one child must render a `button`. */
export type DrawerCloseProps = OverlayTriggerProps;

/** Closes the drawer. The child gets the behavior and keeps its own `onClick`. */
export function DrawerClose({ children, ...props }: DrawerCloseProps) {
  const { register } = useDrawerContext('DrawerClose');
  useRegisterPart(register, 'close');
  return <BaseDrawer.Close {...props} render={children} />;
}
