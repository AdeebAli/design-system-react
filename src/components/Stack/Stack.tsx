import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';

interface StackOwnProps {
  /**
   * The space between children. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   * @default '3'
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
