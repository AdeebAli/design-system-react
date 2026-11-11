import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import { ArrowDownIcon } from '../Icon/internal/ArrowDown';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { ArrowUpDownIcon } from '../Icon/internal/ArrowUpDown';
import * as styles from './Table.css';
import type { TableAlign } from './TableHeader';

/** A column's sort state. */
export type TableSortDirection = 'ascending' | 'descending' | 'none';

interface TableSortHeaderOwnProps {
  /** The column's current sort state. */
  direction: TableSortDirection;
  /** Alignment of the content. @default 'start' */
  align?: TableAlign;
  children?: ReactNode;
}

type SortAction<E extends ElementType> =
  | {
      /** Called with no arguments. The project decides the next direction. */
      onSort: () => void;
      href?: never;
      as?: never;
    }
  | {
      /** Renders a link, for sorting through the URL. */
      href: string;
      /** A router link to render instead of `a`. */
      as?: E;
      onSort?: never;
    };

/** `TableSortHeader`'s props. Native attributes go to the `th`. */
export type TableSortHeaderProps<E extends ElementType = 'a'> =
  TableSortHeaderOwnProps &
    SortAction<E> &
    Omit<
      ComponentPropsWithRef<'th'>,
      keyof TableSortHeaderOwnProps | 'align' | 'onSort' | 'href' | 'as'
    >;

const ICONS = {
  ascending: ArrowUpIcon,
  descending: ArrowDownIcon,
  none: ArrowUpDownIcon,
} as const;

/**
 * A column header that shows a sort state. The project sorts its own data:
 * `onSort` needs a client component, `href` works from a server one.
 */
export function TableSortHeader<E extends ElementType = 'a'>({
  direction,
  align = 'start',
  onSort,
  href,
  as,
  className,
  children,
  ...props
}: TableSortHeaderProps<E>) {
  const content = (
    <>
      {children}
      <Icon icon={ICONS[direction]} size="sm" className={styles.sortIcon} />
    </>
  );
  const controlClass = cx(
    styles.sortControl,
    styles.sortAlign[align],
    focusRing,
  );
  const Link: ElementType = as ?? 'a';

  return (
    <th
      scope="col"
      aria-sort={direction === 'none' ? undefined : direction}
      data-direction={direction}
      data-align={align}
      className={cx(styles.cell, styles.sortCell, className)}
      {...props}
    >
      {href != null ? (
        <Link href={href} className={controlClass}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={controlClass}
          onClick={() => onSort?.()}
        >
          {content}
        </button>
      )}
    </th>
  );
}
