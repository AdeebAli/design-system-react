import type { ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Badge.css';

/** Badge color meanings. */
export type BadgeTone =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** Badge styles: a tinted background, or a strong one. */
export type BadgeVariant = 'soft' | 'solid';

/** Badge sizes. Both use 12px text. */
export type BadgeSize = 'sm' | 'md';

interface BadgeOwnProps {
  /**
   * The color meaning. The text must carry the meaning too. One of `'neutral'`,
   * `'accent'`, `'success'`, `'warning'`, `'danger'`, or `'info'`.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /** The style. One of `'soft'` or `'solid'`. @default 'soft' */
  variant?: 'soft' | 'solid';
  /** The size. One of `'sm'` or `'md'`. @default 'md' */
  size?: 'sm' | 'md';
  /** An `Icon` element before the text, sized to match it. */
  startIcon?: ReactElement;
  /** The label. Say the status in words; color alone can't. */
  children?: ReactNode;
}

/** `Badge`'s props. */
export type BadgeProps = ComponentProps<'span', BadgeOwnProps>;

/**
 * A small, non-interactive status label.
 *
 * @example
 * ```tsx
 * <Badge tone="success">Paid</Badge>
 * ```
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  startIcon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <Box
      as="span"
      className={cx(styles.badge({ tone, variant, size }), className)}
      {...props}
    >
      {startIcon && <span className={styles.icon}>{startIcon}</span>}
      <span className={styles.label}>{children}</span>
    </Box>
  );
}
