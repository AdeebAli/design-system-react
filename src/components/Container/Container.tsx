import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { MaxWidthValue, Responsive } from '../Box/types';

/** A `Container`'s maximum width. */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full';

const maxWidths: Record<ContainerSize, MaxWidthValue> = {
  sm: 'container.sm',
  md: 'container.md',
  lg: 'container.lg',
  xl: 'container.xl',
  prose: 'prose',
  full: 'full',
};

interface ContainerOwnProps {
  /**
   * The maximum width. Not responsive. One of `'sm'`, `'md'`, `'lg'`, `'xl'`,
   * `'prose'`, or `'full'`.
   * @default 'lg'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full';
  /**
   * The side padding. `'0'` removes it. `space` tokens (`'4'` is 16px, `'px'` is
   * 1px). Responsive.
   * @default { base: '4', md: '6' }
   */
  paddingX?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Sets `display`, which is otherwise left to the element. One of `'none'`,
   * `'block'`, `'inline'`, `'inline-block'`, `'flex'`, `'inline-flex'`,
   * `'grid'`, or `'inline-grid'`. Responsive.
   */
  display?: Responsive<
    | 'none'
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
  >;
}

/** `Container`'s props. */
export type ContainerProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  ContainerOwnProps
>;

/**
 * Centers a page's content, with a maximum width and side padding.
 *
 * @example
 * ```tsx
 * <Container size="md">Page content</Container>
 * ```
 */
export function Container<E extends ElementType = 'div'>({
  size = 'lg',
  paddingX = { base: '4', md: '6' },
  ...props
}: ContainerProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      maxWidth={maxWidths[size]}
      marginX="auto"
      paddingX={paddingX}
      {...rest}
    />
  );
}
