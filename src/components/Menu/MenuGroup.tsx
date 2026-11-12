'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Menu.css';

/** `MenuGroup`'s props. */
export type MenuGroupProps = ComponentProps<'div'>;

/** A labeled section of items. Name it with a `MenuGroupLabel`. */
export function MenuGroup({ className, ...props }: MenuGroupProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.Group
      {...rest}
      className={cx(styles.group, box(layout), className)}
    />
  );
}

/** `MenuGroupLabel`'s props. */
export type MenuGroupLabelProps = ComponentProps<'div'>;

/** Names its `MenuGroup` for screen readers. It isn't a heading. */
export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.GroupLabel
      {...rest}
      className={cx(styles.groupLabel, box(layout), className)}
    />
  );
}
