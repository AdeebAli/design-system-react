'use client';

import { Toggle } from '@base-ui/react/toggle';
import type { ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { CheckIcon } from '../Icon/internal/Check';
import * as styles from './ToggleChip.css';

/** Chip heights: 28 and 32px. */
export type ToggleChipSize = 'sm' | 'md';

interface ToggleChipOwnProps {
  /** Whether it's pressed, when controlled. */
  pressed?: boolean;
  /** Whether it starts pressed, when uncontrolled. @default false */
  defaultPressed?: boolean;
  /** Called with the new pressed state. */
  onPressedChange?: (pressed: boolean) => void;
  /** Its value inside a `ToggleChipGroup`. */
  value?: string;
  /** The size. @default 'md' */
  size?: ToggleChipSize;
  /** Disables it. @default false */
  disabled?: boolean;
  /** An `Icon` element before the text. A check replaces it while pressed. */
  startIcon?: ReactElement;
  /** The chip's label. */
  children?: ReactNode;
}

/** `ToggleChip`'s props. */
export type ToggleChipProps = ComponentProps<'button', ToggleChipOwnProps>;

/** A selectable pill, such as a filter. Pressed chips show a check, so state isn't shown by color alone. */
export function ToggleChip({
  onPressedChange,
  size = 'md',
  startIcon,
  className,
  children,
  ...props
}: ToggleChipProps) {
  const [layout, rest] = splitLayoutProps(props);

  return (
    <Toggle
      className={cx(box(layout), styles.chip, styles.size[size], className)}
      onPressedChange={
        onPressedChange && ((next: boolean) => onPressedChange(next))
      }
      // Internal only: the state drives the check icon, in or out of a group.
      render={(renderProps, state) => (
        <button type="button" {...renderProps}>
          {state.pressed ? (
            <span className={styles.icon}>
              <CheckIcon aria-hidden="true" />
            </span>
          ) : (
            startIcon && <span className={styles.icon}>{startIcon}</span>
          )}
          {children}
        </button>
      )}
      {...rest}
    />
  );
}
