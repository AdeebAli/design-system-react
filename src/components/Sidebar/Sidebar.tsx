'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { Icon } from '../Icon';
import { ChevronLeftIcon } from '../Icon/internal/ChevronLeft';
import { ChevronRightIcon } from '../Icon/internal/ChevronRight';
import { IconButton } from '../IconButton';
import * as styles from './Sidebar.css';
import { SidebarContext, type SidebarContextValue } from './SidebarContext';

/** `Sidebar`'s strings, for translation. */
export interface SidebarLabels {
  /** The collapse button's name while expanded. @default 'Collapse sidebar' */
  collapse?: string;
  /** The collapse button's name while collapsed. @default 'Expand sidebar' */
  expand?: string;
  /** The small-screen drawer's close button. @default 'Close' */
  close?: string;
}

interface SidebarOwnProps {
  /** The landmark's name, so several `nav`s stay distinguishable. */
  'aria-label': string;
  /** The top, always visible, such as a home link. */
  brand?: ReactNode;
  /** The bottom, always visible, such as a `ColorModeToggle`. */
  footer?: ReactNode;
  /** From `md` up, adds a button that shrinks it to a rail of icons. @default false */
  collapsible?: boolean;
  /** Whether it's a rail, when controlled. No effect below `md`. */
  collapsed?: boolean;
  /** Whether it starts as a rail, when uncontrolled. @default false */
  defaultCollapsed?: boolean;
  /** Called with the new collapsed state. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Stays in view at full viewport height, with its links scrolling inside.
   * `false` scrolls with the page, at its content's height. @default true
   */
  sticky?: boolean;
  /** The small-screen menu button's name. @default 'Menu' */
  menuLabel?: string;
  /** The strings, for translation. */
  labels?: SidebarLabels;
  /** `SidebarGroup`s. */
  children?: ReactNode;
}

/** `Sidebar`'s props. */
export type SidebarProps = ComponentProps<'nav', SidebarOwnProps>;

/**
 * An app's main navigation, down one side of the page. Persisting
 * `collapsed`, such as in a cookie, is the project's.
 */
export function Sidebar({
  brand,
  footer,
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  sticky = true,
  menuLabel = 'Menu',
  labels,
  className,
  children,
  ...props
}: SidebarProps) {
  const [layout, rest] = splitLayoutProps(props);
  // The small-screen bar (Task 4) names its menu button with this.
  void menuLabel;
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? uncontrolled;
  const text = {
    collapse: labels?.collapse ?? 'Collapse sidebar',
    expand: labels?.expand ?? 'Expand sidebar',
  };

  const toggle = () => {
    const next = !collapsed;
    if (controlledCollapsed === undefined) setUncontrolled(next);
    onCollapsedChange?.(next);
  };

  const context = useMemo<SidebarContextValue>(
    () => ({ collapsed, collapsible, inDrawer: false }),
    [collapsed, collapsible],
  );

  return (
    <SidebarContext.Provider value={context}>
      <nav
        {...rest}
        data-collapsed={collapsed ? '' : undefined}
        className={cx(
          box(layout),
          styles.root,
          sticky && styles.sticky,
          className,
        )}
      >
        {(brand != null || collapsible) && (
          <div className={styles.top}>
            {brand != null && <div className={styles.brand}>{brand}</div>}
            {collapsible && (
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={collapsed ? text.expand : text.collapse}
                icon={
                  <Icon
                    icon={collapsed ? ChevronRightIcon : ChevronLeftIcon}
                    className={styles.chevron}
                  />
                }
                onClick={toggle}
                className={styles.collapse}
              />
            )}
          </div>
        )}
        <div className={cx(styles.links, sticky && styles.scrolling)}>
          {children}
        </div>
        {footer != null && <div className={styles.footer}>{footer}</div>}
      </nav>
    </SidebarContext.Provider>
  );
}
