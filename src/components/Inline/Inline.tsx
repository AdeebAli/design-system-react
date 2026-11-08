import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type {
  AlignItemsValue,
  DisplayValue,
  FlexWrapValue,
  JustifyContentValue,
  Responsive,
  SpaceToken,
} from '../Box/types';

interface InlineOwnProps {
  /** The space between children. @default '2' */
  gap?: Responsive<SpaceToken>;
  /** Whether children wrap. @default 'wrap' */
  wrap?: Responsive<FlexWrapValue>;
  /** Cross-axis alignment. @default 'center' */
  align?: Responsive<AlignItemsValue>;
  /** Main-axis alignment. Unset, children sit at the start. */
  justify?: Responsive<JustifyContentValue>;
  /** Overrides `flex`. A missing `base` keeps `flex`. */
  display?: Responsive<DisplayValue>;
}

/** `Inline`'s props. */
export type InlineProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  InlineOwnProps
>;

/** Children in a row that wraps, such as tags or buttons. */
export function Inline<E extends ElementType = 'div'>({
  gap = '2',
  wrap = 'wrap',
  align = 'center',
  justify,
  display,
  ...props
}: InlineProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      display={withDefaultDisplay(display, 'flex')}
      gap={gap}
      flexWrap={wrap}
      alignItems={align}
      justifyContent={justify}
      {...rest}
    />
  );
}
