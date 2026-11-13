'use client';

import type { ElementType, MouseEvent, ReactElement, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { Box } from '../Box';
import { Tooltip } from '../Tooltip';
import * as styles from './Sidebar.css';
import { useSidebar } from './SidebarContext';

interface SidebarLinkOwnProps {
  /** Where it goes. */
  href: string;
  /** Marks the current page. The library doesn't read the URL. @default false */
  active?: boolean;
  /** An `Icon` element before the text. Needed under `collapsible`. */
  startIcon?: ReactElement;
  /** An element at the end, such as a `Badge`. A dot on the rail. */
  badge?: ReactElement;
  children?: ReactNode;
}

/** `SidebarLink`'s props. */
export type SidebarLinkProps<E extends ElementType = 'a'> = PolymorphicProps<
  E,
  SidebarLinkOwnProps
>;

/** A link in a `SidebarGroup`. It renders its own `li`. */
export function SidebarLink<E extends ElementType = 'a'>({
  as,
  active = false,
  startIcon,
  badge,
  className,
  children,
  ...props
}: SidebarLinkProps<E>) {
  const sidebar = useSidebar();
  const { onClick } = props as {
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
  // The drawer closes after the project's own handler, unless it cancels the click.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) sidebar?.onNavigate?.(event);
  };
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'a';

  const link = (
    <Box
      as={element}
      className={cx(styles.link, focusRing, className)}
      aria-current={active ? 'page' : undefined}
      data-active={active ? '' : undefined}
      {...rest}
      onClick={handleClick}
    >
      {startIcon && <span className={styles.linkIcon}>{startIcon}</span>}
      <span className={styles.linkLabel}>{children}</span>
      {badge && (
        <span data-sidebar-badge="" className={styles.badge}>
          <span className={styles.badgeCount}>{badge}</span>
        </span>
      )}
    </Box>
  );

  if (sidebar == null) {
    warnOnce(
      'SidebarLink-outside',
      'SidebarLink: render it inside a Sidebar, which supplies its list. Use Link for a link anywhere else.',
    );
    return link;
  }
  if (sidebar.collapsible && !startIcon) {
    warnOnce(
      'SidebarLink-icon',
      'SidebarLink: under a collapsible Sidebar, give each link a startIcon, or it is blank on the rail.',
    );
  }
  return (
    <li className={styles.item}>
      {/* Always rendered, so toggling the rail doesn't remount the link. */}
      <Tooltip
        content={children}
        side="end"
        disabled={!sidebar.collapsed || sidebar.inDrawer}
      >
        {link}
      </Tooltip>
    </li>
  );
}
