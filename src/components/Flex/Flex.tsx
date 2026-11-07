import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type {
  AlignItemsValue,
  DisplayValue,
  FlexDirectionValue,
  FlexWrapValue,
  JustifyContentValue,
  Responsive,
  SpaceToken,
} from '../Box/types';

interface FlexOwnProps {
  /** The direction children flow in. @default 'row' */
  direction?: Responsive<FlexDirectionValue>;
  /** Whether children wrap. @default 'nowrap' */
  wrap?: Responsive<FlexWrapValue>;
  /** Cross-axis alignment. Unset, children stretch. */
  align?: Responsive<AlignItemsValue>;
  /** Main-axis alignment. Unset, children sit at the start. */
  justify?: Responsive<JustifyContentValue>;
  /** The space between children. */
  gap?: Responsive<SpaceToken>;
  /** The space between rows. */
  rowGap?: Responsive<SpaceToken>;
  /** The space between columns. */
  columnGap?: Responsive<SpaceToken>;
  /** Overrides `flex`. A missing `base` keeps `flex`. */
  display?: Responsive<DisplayValue>;
}

/** `Flex`'s props. */
export type FlexProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  FlexOwnProps
>;

/** Full flexbox control. */
export function Flex<E extends ElementType = 'div'>({
  direction,
  wrap,
  align,
  justify,
  display,
  ...props
}: FlexProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      display={withDefaultDisplay(display, 'flex')}
      flexDirection={direction}
      flexWrap={wrap}
      alignItems={align}
      justifyContent={justify}
      {...rest}
    />
  );
}
