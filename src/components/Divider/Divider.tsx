import type { ReactNode, Ref } from 'react';
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
  'children' | 'role' | 'ref' | keyof DividerVariant
> &
  DividerVariant & {
    /** The element: an `hr` by default, a `div` when vertical or labeled. */
    ref?: Ref<HTMLElement>;
  };

/**
 * A line between things. Set `decorative` when the layout already separates
 * them, so a screen reader doesn't read each line.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  decorative = false,
  className,
  ref,
  ...props
}: DividerProps) {
  // Every element it renders is an HTMLElement; Box types its ref by tag.
  const divRef = ref as Ref<HTMLDivElement> | undefined;
  const hidden = decorative ? { 'aria-hidden': true } : {};
  if (orientation === 'vertical') {
    return (
      <Box
        ref={divRef}
        className={cx(styles.vertical, className)}
        {...props}
        role="separator"
        aria-orientation="vertical"
        {...hidden}
      />
    );
  }
  // No separator role: screen readers treat a separator's contents as
  // decoration and skip the label, so it's plain text between drawn lines.
  if (label !== undefined && label !== null) {
    return (
      <Box ref={divRef} className={cx(styles.labeled, className)} {...props}>
        <span className={styles.labelText}>{label}</span>
      </Box>
    );
  }
  // Div props fit an `hr`, but Box can't see that.
  const rest: object = { ...props, ref };
  return (
    <Box
      as="hr"
      className={cx(styles.horizontal, className)}
      {...rest}
      {...hidden}
    />
  );
}
