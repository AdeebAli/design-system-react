'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { CheckIcon } from '../Icon/internal/Check';
import * as styles from './Menu.css';

interface MenuRadioItemOwnProps {
  /** This item's value in its `MenuRadioGroup`. */
  value: string;
  /** Whether the menu closes when the item is clicked. @default false */
  closeOnClick?: boolean;
  /** Ignores interaction. @default false */
  disabled?: boolean;
}

/** `MenuRadioItem`'s props. */
export type MenuRadioItemProps = ComponentProps<'div', MenuRadioItemOwnProps>;

/** An option in a `MenuRadioGroup`. A check icon marks the selected one. */
export function MenuRadioItem({
  closeOnClick = false,
  className,
  children,
  ...props
}: MenuRadioItemProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.RadioItem
      {...rest}
      closeOnClick={closeOnClick}
      className={cx(styles.menuItem, styles.checkable, box(layout), className)}
    >
      <span className={styles.indicatorSlot}>
        <BaseMenu.RadioItemIndicator className={styles.indicator}>
          <CheckIcon aria-hidden width="100%" height="100%" />
        </BaseMenu.RadioItemIndicator>
      </span>
      {children}
    </BaseMenu.RadioItem>
  );
}
