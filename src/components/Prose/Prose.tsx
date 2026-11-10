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
  /** The content: elements, MDX, or nothing when `dangerouslySetInnerHTML` sets it. */
  children?: ReactNode;
}

/** `Prose`'s props. */
export type ProseProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  ProseOwnProps
>;

/**
 * Styles long-form content, including plain HTML from Markdown or a CMS. It
 * doesn't sanitize `dangerouslySetInnerHTML`. Set its width here
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
