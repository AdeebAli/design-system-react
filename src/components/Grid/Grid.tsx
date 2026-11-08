import type { ElementType } from 'react';
import { cx } from '../../utils/cx';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type {
  DisplayValue,
  GridCount,
  Responsive,
  SpaceToken,
} from '../Box/types';
import * as styles from './Grid.css';

interface GridOwnProps {
  /** The number of equal columns. @default '1' */
  columns?: Responsive<GridCount>;
  /** The space between cells. @default '3' */
  gap?: Responsive<SpaceToken>;
  /** The space between rows. */
  rowGap?: Responsive<SpaceToken>;
  /** The space between columns. */
  columnGap?: Responsive<SpaceToken>;
  /** `equal` makes every row as tall as the tallest. Not responsive. @default 'auto' */
  autoRows?: 'auto' | 'equal';
  /** Overrides `grid`. A missing `base` keeps `grid`. */
  display?: Responsive<DisplayValue>;
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
