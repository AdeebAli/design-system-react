import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';

interface FlexOwnProps {
  /**
   * The direction children flow in. One of `'row'`, `'column'`, `'row-reverse'`,
   * or `'column-reverse'`. Responsive.
   * @default 'row'
   */
  direction?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
  /**
   * Whether children wrap. One of `'nowrap'` or `'wrap'`. Responsive.
   * @default 'nowrap'
   */
  wrap?: Responsive<'nowrap' | 'wrap'>;
  /**
   * Cross-axis alignment. Unset, children stretch. One of `'start'`, `'center'`,
   * `'end'`, `'stretch'`, or `'baseline'`. Responsive.
   */
  align?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /**
   * Main-axis alignment. Unset, children sit at the start. One of `'start'`,
   * `'center'`, `'end'`, or `'between'`. Responsive.
   */
  justify?: Responsive<'start' | 'center' | 'end' | 'between'>;
  /**
   * The space between children. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  gap?: Responsive<
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
   * The space between rows. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  rowGap?: Responsive<
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
   * The space between columns. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  columnGap?: Responsive<
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
   * Overrides `flex`. A missing `base` keeps `flex`. One of `'none'`, `'block'`,
   * `'inline'`, `'inline-block'`, `'flex'`, `'inline-flex'`, `'grid'`, or
   * `'inline-grid'`. Responsive.
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

/** `Flex`'s props. */
export type FlexProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  FlexOwnProps
>;

/**
 * Full flexbox control.
 *
 * @example
 * ```tsx
 * <Flex gap="2" align="center">
 *   <Avatar name="Ada Lovelace" />
 *   <Text>Ada</Text>
 * </Flex>
 * ```
 */
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
