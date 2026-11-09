'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { Icon } from '../Icon';
import { MenuIcon } from '../Icon/internal/Menu';
import { IconButton } from '../IconButton';
import * as styles from './NavBar.css';
import { NavBarContext, type NavBarContextValue } from './NavBarContext';

interface NavBarOwnProps {
  /** The landmark's name, so several `nav`s stay distinguishable. */
  'aria-label': string;
  /** The left side, always visible, such as a home link. */
  brand?: ReactNode;
  /** The right side, always visible, such as a `ColorModeToggle`. */
  actions?: ReactNode;
  /** Stays at the top when the page scrolls. @default false */
  sticky?: boolean;
  /** The menu button's accessible name. @default 'Menu' */
  menuLabel?: string;
  /** `NavBarLink`s, or components rendering them. */
  children?: ReactNode;
}

/** `NavBar`'s props. */
export type NavBarProps = ComponentProps<'nav', NavBarOwnProps>;

/**
 * The site's main navigation bar. Below `md`, links collapse behind a menu
 * button into a panel that pushes content down.
 */
export function NavBar({
  brand,
  actions,
  sticky = false,
  menuLabel = 'Menu',
  className,
  children,
  onKeyDown,
  ...props
}: NavBarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [layout, rest] = splitLayoutProps(props);

  // The link it was on is now hidden, so focus goes to the menu button, unless
  // the button is hidden too because the window has widened past md.
  const close = useCallback(() => {
    setOpen(false);
    const trigger = triggerRef.current;
    if (trigger?.checkVisibility()) trigger.focus();
  }, [setOpen]);

  const context = useMemo<NavBarContextValue>(
    () => ({
      open,
      closeFromLink: () => {
        if (open) close();
      },
    }),
    [open, close],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    // React bubbles keys from portaled popups in `actions`, such as a Select
    // closing on Escape, so act only on keys from inside the nav's own DOM.
    if (
      open &&
      event.key === 'Escape' &&
      !event.defaultPrevented &&
      event.currentTarget.contains(event.target as Node)
    ) {
      close();
    }
  };

  return (
    <NavBarContext.Provider value={context}>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        // The nav's own props go on the rendered element, so they keep its types.
        render={
          // Delegates Escape from the links and the menu button inside it.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <nav onKeyDown={handleKeyDown} {...rest} />
        }
        className={cx(
          box(layout),
          styles.root,
          sticky && styles.sticky,
          className,
        )}
      >
        {brand != null && <div className={styles.brand}>{brand}</div>}
        {actions != null && <div className={styles.actions}>{actions}</div>}
        <Collapsible.Trigger
          ref={triggerRef}
          className={styles.menuButton}
          render={
            <IconButton
              icon={<Icon icon={MenuIcon} />}
              aria-label={menuLabel}
              variant="ghost"
              size="md"
            />
          }
        />
        <Collapsible.Panel keepMounted className={styles.panel}>
          <ul className={styles.list}>{children}</ul>
        </Collapsible.Panel>
      </Collapsible.Root>
    </NavBarContext.Provider>
  );
}
