'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Menu.css';

/** `MenuSeparator`'s props. */
export type MenuSeparatorProps = ComponentProps<'div'>;

/** A line between groups of items. */
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.Separator
      {...rest}
      className={cx(styles.separator, box(layout), className)}
    />
  );
}
