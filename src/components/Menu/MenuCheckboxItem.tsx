'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { CheckIcon } from '../Icon/internal/Check';
import * as styles from './Menu.css';

interface MenuCheckboxItemOwnProps {
  /** Whether it's checked, when controlled. */
  checked?: boolean;
  /** Whether it starts checked, when uncontrolled. @default false */
  defaultChecked?: boolean;
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the menu closes when the item is clicked. @default false */
  closeOnClick?: boolean;
  /** Ignores interaction. @default false */
  disabled?: boolean;
}

/** `MenuCheckboxItem`'s props. */
export type MenuCheckboxItemProps = ComponentProps<
  'div',
  MenuCheckboxItemOwnProps
>;

/** A menu item that toggles. A check icon marks it when checked. */
export function MenuCheckboxItem({
  onCheckedChange,
  closeOnClick = false,
  className,
  children,
  ...props
}: MenuCheckboxItemProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.CheckboxItem
      {...rest}
      onCheckedChange={(checked) => onCheckedChange?.(checked)}
      closeOnClick={closeOnClick}
      className={cx(styles.menuItem, styles.checkable, box(layout), className)}
    >
      <span className={styles.indicatorSlot}>
        <BaseMenu.CheckboxItemIndicator className={styles.indicator}>
          <CheckIcon aria-hidden width="100%" height="100%" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  );
}
