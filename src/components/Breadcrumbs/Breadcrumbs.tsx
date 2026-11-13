import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Breadcrumbs.css';

interface BreadcrumbsOwnProps {
  /** The landmark's name. @default 'Breadcrumbs' */
  'aria-label'?: string;
  /** The text size. @default 'sm' */
  size?: 'sm' | 'md';
  /** `BreadcrumbItem`s, the current page last. */
  children?: ReactNode;
}

/** `Breadcrumbs`' props. */
export type BreadcrumbsProps = ComponentProps<'nav', BreadcrumbsOwnProps>;

/**
 * Where a page sits, with links back up. Long trails wrap. It has no context
 * or `"use client"`, so it works in a server component.
 */
export function Breadcrumbs({
  'aria-label': ariaLabel = 'Breadcrumbs',
  size = 'sm',
  className,
  children,
  ...props
}: BreadcrumbsProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <nav
      aria-label={ariaLabel}
      className={cx(box(layout), styles.root, styles.size[size], className)}
      {...rest}
    >
      <ol className={styles.list}>{children}</ol>
    </nav>
  );
}
