import type { ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Prose.css';

/** `NotProse`'s props. */
export type NotProseProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  {
    /** Content that `Prose` leaves alone. */
    children?: ReactNode;
  }
>;

/**
 * An area inside `Prose` that it leaves alone, such as a `Card` in an article.
 * It resets the font and color `Prose` sets on its root.
 */
export function NotProse<E extends ElementType = 'div'>({
  as,
  className,
  ...props
}: NotProseProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'div';
  return (
    <Box as={element} className={cx(styles.notProse, className)} {...rest} />
  );
}
