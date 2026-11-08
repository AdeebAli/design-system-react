import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type {
  DisplayValue,
  MaxWidthValue,
  Responsive,
  SpaceToken,
} from '../Box/types';

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
  /** The maximum width. Not responsive. @default 'lg' */
  size?: ContainerSize;
  /** The side padding. `'0'` removes it. @default { base: '4', md: '6' } */
  paddingX?: Responsive<SpaceToken>;
  /** Sets `display`, which is otherwise left to the element. */
  display?: Responsive<DisplayValue>;
}

/** `Container`'s props. */
export type ContainerProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  ContainerOwnProps
>;

/** Centers a page's content, with a maximum width and side padding. */
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
