import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Divider.css';

type DividerVariant =
  | {
      /** @default 'horizontal' */
      orientation?: 'horizontal';
      /** Centered text in the line. Horizontal only. */
      label?: ReactNode;
      /** Removes it from the accessibility tree. Not with `label`. */
      decorative?: false;
    }
  | { orientation?: 'horizontal'; decorative: true; label?: never }
  | { orientation: 'vertical'; label?: never; decorative?: boolean };

/** `Divider`'s props. */
export type DividerProps = Omit<
  ComponentProps<'div'>,
  'children' | 'role' | keyof DividerVariant
> &
  DividerVariant;

/**
 * A line between things. Set `decorative` when the layout already separates
 * them, so a screen reader doesn't read each line.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  decorative = false,
  className,
  ...props
}: DividerProps) {
  const hidden = decorative ? { 'aria-hidden': true } : {};
  if (orientation === 'vertical') {
    return (
      <Box
        className={cx(styles.vertical, className)}
        {...props}
        role="separator"
        aria-orientation="vertical"
        {...hidden}
      />
    );
  }
  if (label !== undefined && label !== null) {
    return (
      <Box
        className={cx(styles.labeled, className)}
        {...props}
        role="separator"
      >
        <span className={styles.labelText}>{label}</span>
      </Box>
    );
  }
  // Div props fit an `hr`, but their ref type doesn't, which Box can't see past.
  const rest: object = props;
  return (
    <Box
      as="hr"
      className={cx(styles.horizontal, className)}
      {...rest}
      {...hidden}
    />
  );
}
