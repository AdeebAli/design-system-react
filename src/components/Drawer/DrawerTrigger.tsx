'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { OverlayTriggerProps } from '../overlays/trigger';
import { useDrawerContext, useRegisterPart } from './DrawerContext';

/** `DrawerTrigger`'s props. The one child must render a `button`. */
export type DrawerTriggerProps = OverlayTriggerProps;

/** Opens the drawer. The child gets the behavior and keeps its own `onClick`. */
export function DrawerTrigger({ children, ...props }: DrawerTriggerProps) {
  const { register } = useDrawerContext('DrawerTrigger');
  useRegisterPart(register, 'trigger');
  return <BaseDrawer.Trigger {...props} render={children} />;
}
