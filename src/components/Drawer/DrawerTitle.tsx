'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { cx } from '../../utils/cx';
import { Heading } from '../Heading/Heading';
import * as styles from './Drawer.css';
import { useDrawerContext, useRegisterPart } from './DrawerContext';

/** `DrawerTitle`'s props. */
export type DrawerTitleProps = Omit<
  React.ComponentPropsWithRef<'h2'>,
  'children'
> & {
  /** The drawer's title, which also names it. */
  children?: React.ReactNode;
};

/** The drawer's name. Always an `h2`, since a drawer starts its own heading structure. */
export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  const { register } = useDrawerContext('DrawerTitle');
  useRegisterPart(register, 'title');
  return (
    <BaseDrawer.Title
      {...props}
      className={cx(styles.title, className)}
      render={<Heading level={2} size="xl" />}
    />
  );
}
