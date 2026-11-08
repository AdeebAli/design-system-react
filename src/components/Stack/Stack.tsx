import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type {
  AlignItemsValue,
  DisplayValue,
  JustifyContentValue,
  Responsive,
  SpaceToken,
} from '../Box/types';

interface StackOwnProps {
  /** The space between children. @default '3' */
  gap?: Responsive<SpaceToken>;
  /** Cross-axis alignment. Unset, children stretch. */
  align?: Responsive<AlignItemsValue>;
  /** Main-axis alignment. Unset, children sit at the start. */
  justify?: Responsive<JustifyContentValue>;
  /** Overrides `flex`. A missing `base` keeps `flex`. */
  display?: Responsive<DisplayValue>;
}

/** `Stack`'s props. */
export type StackProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  StackOwnProps
>;

/** Children from top to bottom. */
export function Stack<E extends ElementType = 'div'>({
  gap = '3',
  align,
  justify,
  display,
  ...props
}: StackProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      display={withDefaultDisplay(display, 'flex')}
      flexDirection="column"
      gap={gap}
      alignItems={align}
      justifyContent={justify}
      {...rest}
    />
  );
}
