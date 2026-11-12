'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactElement } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { ChevronRightIcon } from '../Icon/internal/ChevronRight';
import * as styles from './Menu.css';

interface MenuSubmenuTriggerOwnProps {
  /** An `Icon` element before the label. */
  startIcon?: ReactElement;
  /** Ignores interaction and can't open the submenu. @default false */
  disabled?: boolean;
}

/** `MenuSubmenuTrigger`'s props. */
export type MenuSubmenuTriggerProps = ComponentProps<
  'div',
  MenuSubmenuTriggerOwnProps
>;

/** An item that opens a submenu. A chevron at the end flips with text direction. */
export function MenuSubmenuTrigger({
  startIcon,
  className,
  children,
  ...props
}: MenuSubmenuTriggerProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.SubmenuTrigger
      {...rest}
      className={cx(styles.menuItem, box(layout), className)}
    >
      {startIcon && <span className={styles.itemIcon}>{startIcon}</span>}
      <span className={styles.submenuLabel}>{children}</span>
      <span className={cx(styles.itemIcon, styles.chevron)} aria-hidden="true">
        <ChevronRightIcon width="100%" height="100%" />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
}
