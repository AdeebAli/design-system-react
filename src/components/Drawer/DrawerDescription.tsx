'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { Text } from '../Text/Text';
import { useDrawerContext, useRegisterPart } from './DrawerContext';

/** `DrawerDescription`'s props. */
export type DrawerDescriptionProps = React.ComponentPropsWithRef<'p'>;

/** Describes the drawer. Renders a `p`. */
export function DrawerDescription(props: DrawerDescriptionProps) {
  const { register } = useDrawerContext('DrawerDescription');
  useRegisterPart(register, 'description');
  return <BaseDrawer.Description {...props} render={<Text tone="muted" />} />;
}
