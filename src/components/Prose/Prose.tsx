import type { ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { withDefault } from '../../utils/withDefaultDisplay';
import { Box } from '../Box';
import * as styles from './Prose.css';

/** The reading size: 16px (`sm`) or 18px (`md`) body text. */
export type ProseSize = 'sm' | 'md';

interface ProseOwnProps {
  /** The reading size. @default 'md' */
  size?: ProseSize;
  /** The content, as elements or MDX. */
  children?: ReactNode;
  /** Not accepted: content comes from `children` or MDX, not an HTML string. */
  dangerouslySetInnerHTML?: never;
}

/** `Prose`'s props. */
export type ProseProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  ProseOwnProps
>;

/**
 * Styles long-form content, given as elements or MDX. Set its width here
 * rather than on a wrapper, since `ch` depends on its own font, and add
 * `marginX="auto"` to center it.
 */
export function Prose<E extends ElementType = 'div'>({
  as,
  size = 'md',
  maxWidth,
  className,
  ...props
}: ProseProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'div';
  return (
    <Box
      as={element}
      maxWidth={withDefault(maxWidth, 'prose')}
      className={cx(styles.prose, styles.proseSize[size], className)}
      {...rest}
    />
  );
}
