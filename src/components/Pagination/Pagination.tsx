import type { ElementType, SVGProps } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { warnOnce } from '../../utils/warn';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { ChevronLeftIcon } from '../Icon/internal/ChevronLeft';
import { ChevronRightIcon } from '../Icon/internal/ChevronRight';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import * as styles from './Pagination.css';
import { pageRange } from './pageRange';

/** `Pagination`'s strings, for translation. */
export interface PaginationLabels {
  /** The previous button's name. @default 'Previous' */
  previous?: string;
  /** The next button's name. @default 'Next' */
  next?: string;
  /** A page button's name, where `{page}` is its number. @default 'Page {page}' */
  page?: string;
  /** The text between the buttons below `sm`. @default 'Page {page} of {total}' */
  status?: string;
}

interface PaginationOwnProps {
  /** The current page, starting at 1. */
  page: number;
  /** How many pages there are. With 0 or 1, nothing renders. */
  totalPages: number;
  /** Pages shown beside the current one. @default 1 */
  siblingCount?: 0 | 1 | 2;
  /** The button size. @default 'md' */
  size?: 'sm' | 'md';
  /** The landmark's name. @default 'Pagination' */
  'aria-label'?: string;
  /** The strings, for translation. */
  labels?: PaginationLabels;
}

interface LinkMode<E extends ElementType> {
  /** Renders links. Works from a server component. */
  getHref: (page: number) => string;
  /** The router link component used with `getHref`. @default 'a' */
  as?: E;
  onPageChange?: never;
}

interface ButtonMode {
  /** Renders buttons. Needs a client parent. */
  onPageChange: (page: number) => void;
  getHref?: never;
  as?: never;
}

/** `Pagination`'s props: one of `getHref` or `onPageChange` is required. */
export type PaginationProps<E extends ElementType = 'a'> = PaginationOwnProps &
  (LinkMode<E> | ButtonMode) &
  Omit<ComponentProps<'nav', PaginationOwnProps>, 'children'>;

const fill = (text: string, values: Record<string, number>) =>
  text.replace(/\{(page|total)\}/g, (_, key: string) => String(values[key]));

/**
 * Page navigation. With `getHref` it renders links, which work without
 * JavaScript. With `onPageChange` it renders buttons. Below `sm` it shows
 * previous, "Page 3 of 10", and next.
 */
export function Pagination<E extends ElementType = 'a'>({
  page,
  totalPages,
  getHref,
  onPageChange,
  as,
  siblingCount = 1,
  size = 'md',
  'aria-label': ariaLabel = 'Pagination',
  labels,
  className,
  ...props
}: PaginationProps<E>) {
  const [layout, rest] = splitLayoutProps(props);
  if (totalPages <= 1) return null;
  if (page < 1 || page > totalPages) {
    warnOnce(
      'Pagination-page',
      `Pagination: \`page\` is ${page}, outside 1 to ${totalPages}. Pass a page within range.`,
    );
  }

  const text = {
    previous: labels?.previous ?? 'Previous',
    next: labels?.next ?? 'Next',
    page: labels?.page ?? 'Page {page}',
    status: labels?.status ?? 'Page {page} of {total}',
  };

  // The props that make a control a link or a button for the given page.
  const target = (
    to: number,
  ): { as: ElementType; href: string } | { onClick: () => void } =>
    getHref
      ? { as: as ?? 'a', href: getHref(to) }
      : { onClick: () => onPageChange?.(to) };

  const step = (
    to: number,
    enabled: boolean,
    label: string,
    icon: ElementType<SVGProps<SVGSVGElement>>,
  ) => (
    <IconButton
      variant="ghost"
      size={size}
      aria-label={label}
      icon={<Icon icon={icon} className={styles.chevron} />}
      {...(enabled ? target(to) : { disabled: true })}
    />
  );
  const previous = step(page - 1, page > 1, text.previous, ChevronLeftIcon);
  const next = step(page + 1, page < totalPages, text.next, ChevronRightIcon);

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(box(layout), styles.root, className)}
      {...rest}
    >
      <ol className={styles.full}>
        <li>{previous}</li>
        {pageRange(page, totalPages, siblingCount).map((item, index) =>
          item === 'ellipsis' ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className={styles.ellipsis}
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? 'soft' : 'ghost'}
                size={size}
                aria-label={fill(text.page, { page: item })}
                aria-current={item === page ? 'page' : undefined}
                data-current={item === page ? '' : undefined}
                className={cx(styles.page, item === page && styles.current)}
                {...target(item)}
              >
                {item}
              </Button>
            </li>
          ),
        )}
        <li>{next}</li>
      </ol>
      <div className={styles.compact}>
        {previous}
        <Text size="sm" tone="muted">
          {fill(text.status, { page, total: totalPages })}
        </Text>
        {next}
      </div>
    </nav>
  );
}
