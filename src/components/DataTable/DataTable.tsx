'use client';

import {
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { warnOnce } from '../../utils/warn';
import { box } from '../Box';
import type { LayoutProps } from '../Box/types';
import { Pagination, type PaginationLabels } from '../Pagination';
import { Skeleton } from '../Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
  type TableAlign,
  type TableProps,
} from '../Table';
import * as styles from './DataTable.css';
import { sortRows } from './sortRows';

/** The sorted column and its direction, or `null` for unsorted. */
export type DataTableSort = {
  column: string;
  direction: 'ascending' | 'descending';
} | null;

/** `DataTable`'s strings, for translation. */
export type DataTableLabels = PaginationLabels;

interface ColumnBase<Row> {
  /** Identifies the column in `sort`. */
  id: string;
  /** The header's content. */
  header: ReactNode;
  /** The cell's content for a row. */
  cell: (row: Row) => ReactNode;
  /** Makes this column's cells row headers. Exactly one column needs it. */
  rowHeader?: boolean;
  /** Alignment of the header and cells. @default 'start' */
  align?: TableAlign;
}

/**
 * A column. `sortValue` makes it sortable and `DataTable` sorts it;
 * `sortable` makes it sortable without sorting, for a server. Not both.
 */
export type DataTableColumn<Row> = ColumnBase<Row> &
  (
    | {
        /** Makes the column sortable, sorted by `DataTable`. Return one type per column: in a mixed column, numbers sort before strings, and `null` last, in both directions. */
        sortValue: (row: Row) => string | number | null;
        sortable?: never;
      }
    | {
        /** Makes the column sortable without sorting: report it through `onSortChange`. */
        sortable?: boolean;
        sortValue?: never;
      }
  );

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

type Paging =
  | { pageSize?: undefined; totalRows?: never }
  | {
      /** Turns on pagination: rows per page. */
      pageSize: number;
      /** For rows paged by a server: `rows` is the current page and isn't sliced. @default rows.length */
      totalRows?: number;
    };

interface DataTableOwnProps<Row> {
  /** The rows to show. */
  rows: readonly Row[];
  /** The columns. */
  columns: readonly DataTableColumn<Row>[];
  /** A unique, stable id for a row. */
  getRowId: (row: Row) => string;
  /** The sorted column, when controlled. */
  sort?: DataTableSort;
  /** The initial sort, when uncontrolled. @default null */
  defaultSort?: DataTableSort;
  /** Called with the next sort. */
  onSortChange?: (sort: DataTableSort) => void;
  /** The current page, starting at 1, when controlled. */
  page?: number;
  /** The initial page, when uncontrolled. @default 1 */
  defaultPage?: number;
  /** Called with the next page. */
  onPageChange?: (page: number) => void;
  /** Shows `Skeleton` rows when there are no rows, and sets `aria-busy`. @default false */
  loading?: boolean;
  /** Shown when there are no rows, usually an `EmptyState`. */
  empty?: ReactNode;
  /** The strings, for translation. */
  labels?: DataTableLabels;
  /** A BCP 47 tag for sorting strings. @default 'en-US' */
  locale?: string;
}

/** `DataTable`'s props. Layout props go to an outer element, except `height` and `maxHeight`. */
export type DataTableProps<Row> = DataTableOwnProps<Row> &
  AccessibleName &
  Paging &
  Pick<
    TableProps,
    | 'size'
    | 'stickyHeader'
    | 'stickyFirstColumn'
    | 'stickyBackground'
    | 'hoverable'
    | 'scrollable'
  > &
  LayoutProps &
  Omit<
    ComponentPropsWithRef<'table'>,
    | keyof DataTableOwnProps<Row>
    | keyof LayoutProps
    | 'children'
    | 'size'
    | 'aria-label'
    | 'aria-labelledby'
    | 'hoverable'
  >;

const SKELETON_ROWS = 5;

/**
 * A table that manages sorting, pagination, and the loading and empty
 * states. Use `Table` for display and server rendering.
 */
export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize,
  totalRows,
  loading = false,
  empty,
  labels,
  locale = 'en-US',
  ...props
}: DataTableProps<Row>) {
  const [layout, rest] = splitLayoutProps(props);
  const { height, maxHeight, ...outerLayout } = layout;

  const [sortState, setSortState] = useState<DataTableSort>(defaultSort);
  const [pageState, setPageState] = useState(defaultPage);
  const sort = sortProp !== undefined ? sortProp : sortState;
  const pageControlled = pageProp !== undefined;

  if (columns.filter((column) => column.rowHeader).length !== 1) {
    warnOnce(
      'DataTable-rowHeader',
      'DataTable: exactly one column needs `rowHeader: true`, so screen readers can name each row. Mark one column.',
    );
  }
  if (totalRows !== undefined && columns.some((c) => c.sortValue)) {
    warnOnce(
      'DataTable-totalRows-sortValue',
      'DataTable: with `totalRows`, `sortValue` would sort only the current page. Use `sortable` and sort in `onSortChange`.',
    );
  }

  const collator = useMemo(() => {
    try {
      return new Intl.Collator(locale);
    } catch {
      warnOnce(
        `DataTable-locale-${locale}`,
        `DataTable: \`locale\` "${locale}" isn't a valid BCP 47 tag, so sorting uses the default order. Pass a tag such as "en-US".`,
      );
      return new Intl.Collator();
    }
  }, [locale]);
  const sortColumn = sort
    ? columns.find((c) => c.id === sort.column)
    : undefined;
  const sorted = useMemo(
    () =>
      sort && sortColumn?.sortValue
        ? sortRows(rows, sortColumn.sortValue, sort.direction, collator)
        : rows,
    [rows, sort, sortColumn, collator],
  );

  // Only a positive whole number turns paging on, and only a finite count is a total.
  const paging =
    pageSize !== undefined && Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : undefined;
  if (pageSize !== undefined && paging === undefined) {
    warnOnce(
      'DataTable-pageSize',
      `DataTable: \`pageSize\` is ${pageSize}, so paging is off. Pass a positive whole number.`,
    );
  }
  const serverTotal =
    totalRows !== undefined && Number.isFinite(totalRows)
      ? totalRows
      : undefined;
  const total = serverTotal ?? sorted.length;
  const lastPage =
    paging === undefined ? 1 : Math.max(1, Math.ceil(total / paging));
  const clampPage = (value: number) =>
    Number.isFinite(value)
      ? Math.min(Math.max(Math.trunc(value), 1), lastPage)
      : 1;
  // Pagination gets the consumer's controlled value, and warns if it's invalid.
  const page = pageControlled ? pageProp : clampPage(pageState);
  // An uncontrolled page left past the end by shrinking rows moves to the last one.
  if (!pageControlled && pageState !== page) setPageState(page);

  const goToPage = (next: number) => {
    if (next === page) return;
    if (!pageControlled) setPageState(next);
    onPageChange?.(next);
  };

  const visible =
    paging !== undefined && serverTotal === undefined
      ? sorted.slice((clampPage(page) - 1) * paging, clampPage(page) * paging)
      : sorted;

  const changeSort = (column: string) => {
    const next: DataTableSort =
      sort?.column !== column
        ? { column, direction: 'ascending' }
        : sort.direction === 'ascending'
          ? { column, direction: 'descending' }
          : null;
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
    goToPage(1);
  };

  const showSkeleton = loading && rows.length === 0;
  const showEmpty = !loading && rows.length === 0 && empty != null;

  return (
    <div
      aria-busy={loading || undefined}
      className={cx(styles.root, box(outerLayout))}
    >
      <Table {...rest} height={height} maxHeight={maxHeight}>
        <TableHead>
          <TableRow>
            {columns.map((column) =>
              column.sortValue || column.sortable ? (
                <TableSortHeader
                  key={column.id}
                  align={column.align}
                  direction={
                    sort?.column === column.id ? sort.direction : 'none'
                  }
                  onSort={() => changeSort(column.id)}
                >
                  {column.header}
                </TableSortHeader>
              ) : (
                <TableHeader key={column.id} align={column.align}>
                  {column.header}
                </TableHeader>
              ),
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {showSkeleton ? (
            Array.from({ length: paging ?? SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} hoverable={false}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : showEmpty ? (
            <TableRow hoverable={false}>
              <TableCell colSpan={columns.length}>{empty}</TableCell>
            </TableRow>
          ) : (
            visible.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) =>
                  column.rowHeader ? (
                    <TableHeader
                      key={column.id}
                      scope="row"
                      align={column.align}
                    >
                      {column.cell(row)}
                    </TableHeader>
                  ) : (
                    <TableCell key={column.id} align={column.align}>
                      {column.cell(row)}
                    </TableCell>
                  ),
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {paging !== undefined && (
        <Pagination
          page={page}
          totalPages={lastPage}
          onPageChange={goToPage}
          labels={labels}
        />
      )}
    </div>
  );
}
