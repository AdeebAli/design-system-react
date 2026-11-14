'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { warnOnce } from '../../utils/warn';
import { box } from '../Box';
import type { LayoutProps } from '../Box/types';
import { Icon } from '../Icon';
import { CheckIcon } from '../Icon/internal/Check';
import { Pagination, type PaginationLabels } from '../Pagination';
import { Skeleton } from '../Skeleton';
import { VisuallyHidden } from '../VisuallyHidden';
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
import {
  INTERACTIVE_SELECTOR,
  isInteractiveTarget,
} from './isInteractiveTarget';
import { SelectionToolbar } from './SelectionToolbar';
import { sortRows } from './sortRows';

/** The sorted column and its direction, or `null` for unsorted. */
export type DataTableSort = {
  column: string;
  direction: 'ascending' | 'descending';
} | null;

/** `DataTable`'s strings, for translation. */
export interface DataTableLabels extends PaginationLabels {
  /** Hidden text before a row's name, in its selection button. @default 'Select' */
  selectRow?: string;
  /** The toolbar's button that selects every row on the page. @default 'Select page' */
  selectPage?: string;
  /** The toolbar's button that clears the selection. @default 'Clear' */
  clearSelection?: string;
  /** The count of selected rows, where `{count}` is the number. @default '{count} selected' */
  selectedCount?: string;
  /** The toolbar's name. @default 'Selection' */
  selection?: string;
}

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
  | {
      /** Names the table. It needs this or `aria-labelledby`. */
      'aria-label': string;
      'aria-labelledby'?: never;
    }
  | {
      /** The id of an element that names the table, such as a heading. */
      'aria-labelledby': string;
      'aria-label'?: never;
    };

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
  /** Lets rows be selected: one, or many with a toolbar. @default 'none' */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** The selected row ids, when controlled. */
  selectedKeys?: string[];
  /** The initially selected row ids, when uncontrolled. @default [] */
  defaultSelectedKeys?: string[];
  /** Called with every selected row id, in any order. */
  onSelectionChange?: (keys: string[]) => void;
  /** Rows that can't be selected. @default [] */
  disabledKeys?: string[];
  /** Whether clicking anywhere on a row toggles it. @default true */
  selectOnRowClick?: boolean;
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

const DEFAULT_LABELS = {
  selectRow: 'Select',
  selectPage: 'Select page',
  clearSelection: 'Clear',
  selectedCount: '{count} selected',
  selection: 'Selection',
};

interface SelectButtonProps {
  columnId: string;
  selected: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
  children: ReactNode;
}

/** A row header's content as a toggle button. */
function SelectButton({
  columnId,
  selected,
  disabled,
  label,
  onToggle,
  children,
}: SelectButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  const hintId = `${id}-hint`;
  const textId = `${id}-text`;
  useEffect(() => {
    if (ref.current?.querySelector(INTERACTIVE_SELECTOR)) {
      warnOnce(
        `DataTable-rowHeader-interactive-${columnId}`,
        `DataTable: the \`rowHeader\` cell of column "${columnId}" holds links, buttons, or other interactive content, which would nest inside its selection button. Put it in another column.`,
      );
    }
  }, [columnId]);
  return (
    <button
      ref={ref}
      type="button"
      // Joins the hidden label and the text with a space, which collapsing
      // whitespace between the two would lose.
      aria-labelledby={`${hintId} ${textId}`}
      aria-pressed={selected}
      disabled={disabled}
      className={cx(styles.selectButton, focusRing)}
      onClick={onToggle}
    >
      <VisuallyHidden id={hintId}>{label}</VisuallyHidden>
      <span id={textId}>{children}</span>
      {selected && <Icon icon={CheckIcon} size="sm" />}
    </button>
  );
}

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
  selectionMode = 'none',
  selectedKeys: selectedKeysProp,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  selectOnRowClick = true,
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

  const [selectionState, setSelectionState] = useState(
    () => defaultSelectedKeys ?? [],
  );
  const selectedKeys = selectedKeysProp ?? selectionState;
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const disabledSet = useMemo(() => new Set(disabledKeys), [disabledKeys]);
  const selecting = selectionMode !== 'none';
  const text = { ...DEFAULT_LABELS, ...labels };

  const commitSelection = (next: string[]) => {
    if (selectedKeysProp === undefined) setSelectionState(next);
    onSelectionChange?.(next);
  };
  const toggleRow = (key: string) => {
    if (disabledSet.has(key)) return;
    if (selectedSet.has(key)) {
      commitSelection(selectedKeys.filter((k) => k !== key));
    } else {
      commitSelection(
        selectionMode === 'single' ? [key] : [...selectedKeys, key],
      );
    }
  };
  // Select page works on the enabled rows shown, and leaves other pages alone.
  const pageKeys = visible.map(getRowId).filter((key) => !disabledSet.has(key));
  const selectedOnPage = pageKeys.filter((key) => selectedSet.has(key)).length;
  const pageSelection =
    pageKeys.length === 0 || selectedOnPage === 0
      ? 'false'
      : selectedOnPage === pageKeys.length
        ? 'true'
        : 'mixed';
  const togglePage = () => {
    if (pageKeys.length === 0) return;
    if (pageSelection === 'true') {
      const onPage = new Set(pageKeys);
      commitSelection(selectedKeys.filter((key) => !onPage.has(key)));
    } else {
      commitSelection([
        ...selectedKeys,
        ...pageKeys.filter((key) => !selectedSet.has(key)),
      ]);
    }
  };
  const clearSelection = () => {
    if (selectedKeys.length > 0) commitSelection([]);
  };

  const showSkeleton = loading && rows.length === 0;
  const showEmpty = !loading && rows.length === 0 && empty != null;

  return (
    <div
      aria-busy={loading || undefined}
      className={cx(styles.root, box(outerLayout))}
    >
      {selectionMode === 'multiple' && (
        <SelectionToolbar
          count={selectedKeys.length}
          pageState={pageSelection}
          onSelectPage={togglePage}
          onClear={clearSelection}
          labels={text}
        />
      )}
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
            visible.map((row) => {
              const key = getRowId(row);
              const disabled = disabledSet.has(key);
              const selected = selecting && selectedSet.has(key);
              return (
                <TableRow
                  key={key}
                  selected={selected}
                  className={
                    selecting && selectOnRowClick && !disabled
                      ? styles.clickableRow
                      : undefined
                  }
                  onClick={
                    selecting && selectOnRowClick && !disabled
                      ? (event) => {
                          if (
                            !(event.target instanceof Element) ||
                            // Clicks in a portal bubble through React, not the DOM.
                            !event.currentTarget.contains(event.target) ||
                            isInteractiveTarget(
                              event.target,
                              event.currentTarget,
                            ) ||
                            window.getSelection()?.toString()
                          ) {
                            return;
                          }
                          toggleRow(key);
                        }
                      : undefined
                  }
                >
                  {columns.map((column) =>
                    column.rowHeader ? (
                      <TableHeader
                        key={column.id}
                        scope="row"
                        align={column.align}
                      >
                        {selecting ? (
                          <SelectButton
                            columnId={column.id}
                            selected={selected}
                            disabled={disabled}
                            label={text.selectRow}
                            onToggle={() => toggleRow(key)}
                          >
                            {column.cell(row)}
                          </SelectButton>
                        ) : (
                          column.cell(row)
                        )}
                      </TableHeader>
                    ) : (
                      <TableCell key={column.id} align={column.align}>
                        {column.cell(row)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              );
            })
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
