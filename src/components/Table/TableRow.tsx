import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import * as styles from './Table.css';

/** `TableRow`'s props. */
export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  /** Turns hover off for this row, such as one holding an `EmptyState`. @default true */
  hoverable?: boolean;
  /** The selected style only. The project's own control carries the state for assistive technology. @default false */
  selected?: boolean;
  /**
   * Marks a row that a first-column `rowSpan` above covers, so with
   * `stickyFirstColumn` its first cell, which is in the second column,
   * doesn't stick. Set it only on covered rows: on any other row, the row
   * header stops sticking. @default false
   */
  spanned?: boolean;
}

/** A table row. */
export function TableRow({
  hoverable = true,
  selected = false,
  spanned = false,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      data-selected={selected ? '' : undefined}
      data-no-hover={hoverable ? undefined : ''}
      data-spanned={spanned ? '' : undefined}
      className={cx(styles.row, selected && styles.rowSelected, className)}
      {...props}
    />
  );
}
