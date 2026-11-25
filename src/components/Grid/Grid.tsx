import type { ElementType } from 'react';
import { cx } from '../../utils/cx';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';
import * as styles from './Grid.css';

interface GridOwnProps {
  /**
   * The number of equal columns: any positive whole number, as a number or a
   * string (`16`, `'16'`). Responsive.
   * @default '1'
   */
  columns?: Responsive<number | `${number}`>;
  /**
   * The space between cells. `space` tokens (`'4'` is 16px, `'px'` is 1px).
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
   * `equal` makes every row as tall as the tallest. Not responsive. One of
   * `'auto'` or `'equal'`.
   * @default 'auto'
   */
  autoRows?: 'auto' | 'equal';
  /**
   * Overrides `grid`. A missing `base` keeps `grid`. One of `'none'`, `'block'`,
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

/** `Grid`'s props. */
export type GridProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  GridOwnProps
>;

/** A CSS grid with equal columns, and the base for bento layouts. */
export function Grid<E extends ElementType = 'div'>({
  columns = '1',
  gap = '3',
  autoRows,
  display,
  className,
  ...props
}: GridProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      display={withDefaultDisplay(display, 'grid')}
      gridTemplateColumns={columns}
      gap={gap}
      className={cx(autoRows === 'equal' && styles.equalRows, className)}
      {...rest}
    />
  );
}
