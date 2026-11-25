'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import * as styles from './Menu.css';

interface MenuRadioGroupOwnProps {
  /** The selected value, when controlled. */
  value?: string;
  /** The value selected at first, when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
}

/** `MenuRadioGroup`'s props. */
export type MenuRadioGroupProps = ComponentProps<'div', MenuRadioGroupOwnProps>;

/** A group of `MenuRadioItem`s where one is selected. */
export function MenuRadioGroup({
  onValueChange,
  className,
  ...props
}: MenuRadioGroupProps) {
  const [layout, rest] = splitLayoutProps(props);
  const grid = layoutStyle(layout, rest.style, 'MenuRadioGroup');
  return (
    <BaseMenu.RadioGroup
      {...rest}
      style={grid.style}
      onValueChange={(value) => onValueChange?.(value as string)}
      className={cx(styles.group, grid.className, className)}
    />
  );
}
