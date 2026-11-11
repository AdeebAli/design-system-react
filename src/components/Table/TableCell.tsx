import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import * as styles from './Table.css';
import type { TableAlign } from './TableHeader';

/** `TableCell`'s props. */
export interface TableCellProps extends Omit<
  ComponentPropsWithRef<'td'>,
  'align'
> {
  /** Alignment of the content. @default 'start' */
  align?: TableAlign;
}

/** A data cell. */
export function TableCell({
  align = 'start',
  className,
  ...props
}: TableCellProps) {
  return (
    <td
      data-align={align}
      className={cx(styles.cell, styles.align[align], className)}
      {...props}
    />
  );
}
