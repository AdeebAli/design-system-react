import type { ElementType } from 'react';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Skeleton.css';

/** What shape a `Skeleton` takes. */
export type SkeletonVariant = 'rect' | 'circle' | 'text';

interface SkeletonOwnProps {
  /** The shape. `circle` needs a `width` and `height`. @default 'rect' */
  variant?: SkeletonVariant;
  /** How many lines, with `variant="text"`. @default 1 */
  lines?: number;
}

/** `Skeleton`'s props. */
export type SkeletonProps<E extends 'div' | 'span' = 'div'> = Omit<
  PolymorphicProps<E, SkeletonOwnProps>,
  'children'
>;

/**
 * A placeholder for content that's loading. It's always hidden from screen
 * readers: set `aria-busy` on the loading region instead.
 */
export function Skeleton<E extends 'div' | 'span' = 'div'>({
  as,
  variant = 'rect',
  lines = 1,
  width,
  className,
  ...props
}: SkeletonProps<E>) {
  const element: ElementType = as ?? 'div';
  const display = element === 'span' ? 'inline-block' : 'block';
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  if (variant === 'text') {
    const count = Math.max(1, Math.floor(lines));
    return (
      <Box
        as={element}
        aria-hidden="true"
        display={display}
        width={width ?? 'full'}
        className={className}
        {...rest}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={cx(
              styles.line,
              count > 1 && index === count - 1 && styles.lastLine,
            )}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      as={element}
      aria-hidden="true"
      display={display}
      width={width ?? (variant === 'rect' ? 'full' : undefined)}
      className={cx(styles[variant], className)}
      {...rest}
    />
  );
}
