'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactElement } from 'react';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import * as styles from './Menu.css';

interface MenuItemOwnProps {
  /** An `Icon` element before the label. */
  startIcon?: ReactElement;
  /**
   * `danger` marks a destructive action. One of `'neutral'` or `'danger'`.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /** Whether the menu closes when the item is clicked. @default true */
  closeOnClick?: boolean;
  /** Ignores interaction and skips the click handler. @default false */
  disabled?: boolean;
}

/** `MenuItem`'s props. */
export type MenuItemProps = ComponentProps<'div', MenuItemOwnProps>;

/** An action in a menu. */
export function MenuItem({
  startIcon,
  tone = 'neutral',
  closeOnClick = true,
  className,
  children,
  ...props
}: MenuItemProps) {
  const [layout, rest] = splitLayoutProps(props);
  const grid = layoutStyle(layout, rest.style, 'MenuItem');
  return (
    <BaseMenu.Item
      {...rest}
      style={grid.style}
      closeOnClick={closeOnClick}
      className={cx(
        styles.menuItem,
        tone === 'danger' && styles.danger,
        grid.className,
        className,
      )}
    >
      {startIcon && <span className={styles.itemIcon}>{startIcon}</span>}
      {children}
    </BaseMenu.Item>
  );
}
