'use client';

import { ToggleGroup } from '@base-ui/react/toggle-group';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import type { Responsive, SpaceToken } from '../Box/types';
import { OverlayDirection } from '../overlays/direction';

interface ToggleChipGroupOwnProps {
  /** The pressed chips' values, when controlled. */
  value?: readonly string[];
  /** The values pressed at first, when uncontrolled. */
  defaultValue?: readonly string[];
  /**
   * Called with the new values. Pressing the selected chip clears it, even
   * without `multiple`; to keep one selected, control `value` and ignore
   * empty changes.
   */
  onValueChange?: (value: string[]) => void;
  /** Lets several chips be pressed at once. @default false */
  multiple?: boolean;
  /** Disables every chip. @default false */
  disabled?: boolean;
  /** The space between chips. @default '2' */
  gap?: Responsive<SpaceToken>;
  children?: ReactNode;
}

/** `ToggleChipGroup`'s props. It needs `aria-label` or `aria-labelledby`. */
export type ToggleChipGroupProps = ComponentProps<
  'div',
  ToggleChipGroupOwnProps
> &
  ({ 'aria-label': string } | { 'aria-labelledby': string });

/** A wrapping row of `ToggleChip`s, with one or several pressed. */
export function ToggleChipGroup({
  onValueChange,
  gap = '2',
  className,
  ...props
}: ToggleChipGroupProps) {
  const [layout, rest] = splitLayoutProps(props);

  return (
    // Base UI maps arrow keys from a React context, not the DOM `dir`.
    <OverlayDirection>
      <ToggleGroup
        className={cx(
          box({
            ...layout,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap,
          }),
          className,
        )}
        onValueChange={
          onValueChange && ((next: string[]) => onValueChange(next))
        }
        {...rest}
      />
    </OverlayDirection>
  );
}
