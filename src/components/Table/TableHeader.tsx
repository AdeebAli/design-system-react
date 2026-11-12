import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import * as styles from './Table.css';

/** Horizontal alignment of a cell's content. */
export type TableAlign = 'start' | 'center' | 'end';

/** `TableHeader`'s props. */
export interface TableHeaderProps extends Omit<
  ComponentPropsWithRef<'th'>,
  'align'
> {
  /** What the header labels. @default 'col' */
  scope?: 'col' | 'row';
  /** Alignment of the content. @default 'start' */
  align?: TableAlign;
}

/** A header cell. Use `scope="row"` for the first cell of a body row. */
export function TableHeader({
  scope = 'col',
  align = 'start',
  className,
  ...props
}: TableHeaderProps) {
  return (
    <th
      scope={scope}
      data-align={align}
      className={cx(styles.cell, styles.align[align], className)}
      {...props}
    />
  );
}
