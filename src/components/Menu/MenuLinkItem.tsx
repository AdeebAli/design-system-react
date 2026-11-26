'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { PolymorphicProps } from '../../utils/types';
import * as styles from './Menu.css';

interface MenuLinkItemOwnProps {
  /** An `Icon` element before the label. */
  startIcon?: ReactElement;
  /** Whether the menu closes when the item is clicked. @default true */
  closeOnClick?: boolean;
  /** Ignores interaction. @default false */
  disabled?: boolean;
  /** The item's label. */
  children?: ReactNode;
}

/** `MenuLinkItem`'s props. */
export type MenuLinkItemProps<E extends ElementType = 'a'> = PolymorphicProps<
  E,
  MenuLinkItemOwnProps
>;

/**
 * A link in a menu. `as` renders another component, such as a router link,
 * which gets `href` and a `ref`. Unlike Base UI, it closes the menu on click.
 */
export function MenuLinkItem<E extends ElementType = 'a'>({
  as,
  startIcon,
  closeOnClick = true,
  className,
  children,
  ...props
}: MenuLinkItemProps<E>) {
  // The rest depends on the generic `as`, which the layout split can't infer through.
  const [layout, rest] = splitLayoutProps(props as Record<string, unknown>);
  const grid = layoutStyle(
    layout,
    rest.style as CSSProperties | undefined,
    'MenuLinkItem',
  );
  return (
    <BaseMenu.LinkItem
      {...rest}
      style={grid.style}
      render={as ? createElement(as) : undefined}
      closeOnClick={closeOnClick}
      className={cx(styles.menuItem, grid.className, className)}
    >
      {startIcon && <span className={styles.itemIcon}>{startIcon}</span>}
      {children}
    </BaseMenu.LinkItem>
  );
}
