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
  /** The color meaning. The text must carry the meaning too. @default 'neutral' */
  tone?: BadgeTone;
  /** The style. @default 'soft' */
  variant?: BadgeVariant;
  /** The size. @default 'md' */
  size?: BadgeSize;
  /** An `Icon` element before the text, sized to match it. */
  startIcon?: ReactElement;
  children?: ReactNode;
}

/** `Badge`'s props. */
export type BadgeProps = ComponentProps<'span', BadgeOwnProps>;

/** A small, non-interactive status label. */
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
      {children}
    </Box>
  );
}
