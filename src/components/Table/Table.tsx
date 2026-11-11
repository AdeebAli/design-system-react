import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { warnOnce } from '../../utils/warn';
import { box } from '../Box';
import type { LayoutProps } from '../Box/types';
import { focusRing } from '../../styles/focus.css';
import * as styles from './Table.css';

/** Table sizes: `md` pads cells 8px, `sm` pads them 4px by 8px. */
export type TableSize = 'sm' | 'md';

interface TableOwnProps {
  /** The cell padding. @default 'md' */
  size?: TableSize;
  /** Keeps the header rows in view while the wrapper scrolls. Needs a height limit, such as `maxHeight="screen"`. @default false */
  stickyHeader?: boolean;
  /** Keeps each row's first cell in view while the table scrolls sideways. @default false */
  stickyFirstColumn?: boolean;
  /** The background of sticky cells, matching what the table sits on. Has no effect without a sticky prop. @default 'surface' */
  stickyBackground?: 'canvas' | 'surface' | 'raised' | 'sunken';
  /** Highlights a body row on hover. @default true */
  hoverable?: boolean;
  /** Makes the wrapper a focusable region, so keyboard users can scroll it. Needs `aria-label` or `aria-labelledby`. @default false */
  scrollable?: boolean;
}

/** `Table`'s props. Layout props go to the wrapper, the rest to the `table`. */
export type TableProps = TableOwnProps &
  LayoutProps &
  Omit<ComponentPropsWithRef<'table'>, keyof TableOwnProps | keyof LayoutProps>;

/** A styled table inside a scroll wrapper. Compose it from the `Table*` parts. */
export function Table({
  size = 'md',
  // The sticky props are read by the sticky styles, not here.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  stickyHeader: _stickyHeader = false,
  stickyFirstColumn: _stickyFirstColumn = false,
  stickyBackground: _stickyBackground = 'surface',
  /* eslint-enable @typescript-eslint/no-unused-vars */
  hoverable = true,
  scrollable = false,
  className,
  children,
  ...props
}: TableProps) {
  const [layout, rest] = splitLayoutProps(props);
  const label = rest['aria-label'];
  const labelledBy = rest['aria-labelledby'];
  if (scrollable && label == null && labelledBy == null) {
    warnOnce(
      'Table-scrollable-name',
      'Table: `scrollable` makes a region landmark, which needs a name. Pass `aria-label` or `aria-labelledby`.',
    );
  }

  return (
    <div
      data-ds-table=""
      className={cx(styles.wrapper, box(layout), scrollable && focusRing)}
      {...(scrollable && {
        role: 'region',
        tabIndex: 0,
        'aria-label': label,
        'aria-labelledby': labelledBy,
      })}
    >
      <table
        data-size={size}
        className={cx(styles.table, hoverable && styles.hoverable, className)}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}
