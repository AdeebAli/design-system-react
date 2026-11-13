'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { breakpoints } from '../../tokens/breakpoints';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { Drawer, DrawerContent } from '../Drawer';
import { Icon } from '../Icon';
import { ChevronLeftIcon } from '../Icon/internal/ChevronLeft';
import { ChevronRightIcon } from '../Icon/internal/ChevronRight';
import { IconButton } from '../IconButton';
import * as styles from './Sidebar.css';
import { SidebarBar } from './SidebarBar';
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

const md = `(min-width: ${breakpoints.md})`;

/**
 * A click that opens a new tab or window, rather than navigating here. A
 * middle click needs no check: browsers send it as `auxclick`, not `click`.
 */
const opensElsewhere = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  event.currentTarget.target === '_blank';

/**
 * An app's main navigation, down one side of the page. Below `md`, a bar
 * with `brand` and a menu button replaces it, and the button opens the links
 * in a `Drawer`. Persisting `collapsed`, such as in a cookie, is the project's.
 */
export function Sidebar({
  'aria-label': ariaLabel,
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
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  // Only with collapsible, which supplies the button to expand it again.
  const collapsed = collapsible && (controlledCollapsed ?? uncontrolled);
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

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  // Where focus goes when the drawer closes: the menu button, unless the
  // window has grown past md and hidden it.
  const returnFocus = useRef<HTMLElement | null>(null);
  // The drawer's copy has no rail, and a link click closes it.
  const drawerContext = useMemo<SidebarContextValue>(
    () => ({
      collapsed: false,
      collapsible,
      inDrawer: true,
      onNavigate: (event) => {
        if (!opensElsewhere(event)) setOpen(false);
      },
    }),
    [collapsible, setOpen],
  );

  // The menu button is hidden from md up, so the drawer can't stay open there.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(md);
    const close = () => {
      if (!query.matches) return;
      // The bar holds the menu button, and the side nav follows it.
      const nav = menuRef.current?.parentElement?.nextElementSibling;
      returnFocus.current =
        nav?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? null;
      setOpen(false);
    };
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, [open]);

  return (
    <>
      <SidebarBar
        brand={brand}
        menuLabel={menuLabel}
        open={open}
        onOpen={() => {
          returnFocus.current = menuRef.current;
          setOpen(true);
        }}
        menuRef={menuRef}
        sticky={sticky}
      />
      <SidebarContext.Provider value={context}>
        <nav
          {...rest}
          aria-label={ariaLabel}
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
      {/* Its content mounts only while open, which only happens below md. */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          side="start"
          aria-label={menuLabel}
          finalFocus={returnFocus}
          closeLabel={labels?.close ?? 'Close'}
          className={styles.drawer}
        >
          <SidebarContext.Provider value={drawerContext}>
            {brand != null && <div className={styles.drawerBrand}>{brand}</div>}
            <nav
              aria-label={ariaLabel}
              data-sidebar-drawer=""
              className={styles.drawerNav}
            >
              {children}
            </nav>
            {footer != null && (
              <div className={styles.drawerFooter}>{footer}</div>
            )}
          </SidebarContext.Provider>
        </DrawerContent>
      </Drawer>
    </>
  );
}
