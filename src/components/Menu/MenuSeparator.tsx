'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import * as styles from './Menu.css';

/** `MenuSeparator`'s props. */
export type MenuSeparatorProps = ComponentProps<'div'>;

/** A line between groups of items. */
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const [layout, rest] = splitLayoutProps(props);
  const grid = layoutStyle(layout, rest.style, 'MenuSeparator');
  return (
    <BaseMenu.Separator
      {...rest}
      style={grid.style}
      className={cx(styles.separator, grid.className, className)}
    />
  );
}
