import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { DisplayValue, Responsive, SpaceToken } from '../Box/types';

interface InsetOwnProps {
  /** Padding on every side. */
  space?: Responsive<SpaceToken>;
  /** Padding on the start and end sides. */
  x?: Responsive<SpaceToken>;
  /** Padding on the top and bottom. */
  y?: Responsive<SpaceToken>;
  /** Padding on the top. */
  top?: Responsive<SpaceToken>;
  /** Padding on the bottom. */
  bottom?: Responsive<SpaceToken>;
  /** Padding on the start side: left in a left-to-right language. */
  start?: Responsive<SpaceToken>;
  /** Padding on the end side: right in a left-to-right language. */
  end?: Responsive<SpaceToken>;
  /** Sets `display`, which is otherwise left to the element. */
  display?: Responsive<DisplayValue>;
}

/** `Inset`'s props. */
export type InsetProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  InsetOwnProps
>;

/** Padding from the spacing scale. */
export function Inset<E extends ElementType = 'div'>({
  space,
  x,
  y,
  top,
  bottom,
  start,
  end,
  ...props
}: InsetProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      padding={space}
      paddingX={x}
      paddingY={y}
      paddingTop={top}
      paddingBottom={bottom}
      paddingStart={start}
      paddingEnd={end}
      {...rest}
    />
  );
}
