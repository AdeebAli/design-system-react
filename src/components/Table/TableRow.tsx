import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import * as styles from './Table.css';

/** `TableRow`'s props. */
export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  /** Turns hover off for this row, such as one holding an `EmptyState`. @default true */
  hoverable?: boolean;
  /** The selected style only. The project's own control carries the state for assistive technology. @default false */
  selected?: boolean;
}

/** A table row. */
export function TableRow({
  hoverable = true,
  selected = false,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      data-selected={selected ? '' : undefined}
      data-no-hover={hoverable ? undefined : ''}
      className={cx(styles.row, selected && styles.rowSelected, className)}
      {...props}
    />
  );
}
