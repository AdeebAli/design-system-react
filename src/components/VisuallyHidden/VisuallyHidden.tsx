import type { ElementType } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './VisuallyHidden.css';

interface VisuallyHiddenOwnProps {
  /** Becomes visible when focused, for skip links. @default false */
  focusable?: boolean;
}

/** `VisuallyHidden`'s props. */
export type VisuallyHiddenProps<E extends ElementType = 'span'> =
  PolymorphicProps<E, VisuallyHiddenOwnProps>;

/** Text for screen readers only. */
export function VisuallyHidden<E extends ElementType = 'span'>({
  as,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'span';

  return (
    <Box
      as={element}
      className={cx(
        focusable ? cx(styles.focusable, focusRing) : styles.hidden,
        className,
      )}
      {...rest}
    />
  );
}
