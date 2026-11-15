'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  createElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { PolymorphicProps } from '../../utils/types';
import { box } from '../Box';
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
  return (
    <BaseMenu.LinkItem
      {...rest}
      render={as ? createElement(as) : undefined}
      closeOnClick={closeOnClick}
      className={cx(styles.menuItem, box(layout), className)}
    >
      {startIcon && <span className={styles.itemIcon}>{startIcon}</span>}
      {children}
    </BaseMenu.LinkItem>
  );
}
