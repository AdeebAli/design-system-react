import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';

interface InlineOwnProps {
  /**
   * The space between children. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   * @default '2'
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
   * Whether children wrap. One of `'nowrap'` or `'wrap'`. Responsive.
   * @default 'wrap'
   */
  wrap?: Responsive<'nowrap' | 'wrap'>;
  /**
   * Cross-axis alignment. One of `'start'`, `'center'`, `'end'`, `'stretch'`, or
   * `'baseline'`. Responsive.
   * @default 'center'
   */
  align?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /**
   * Main-axis alignment. Unset, children sit at the start. One of `'start'`,
   * `'center'`, `'end'`, or `'between'`. Responsive.
   */
  justify?: Responsive<'start' | 'center' | 'end' | 'between'>;
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
