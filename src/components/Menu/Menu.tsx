'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useSyncExternalStore, type ReactNode } from 'react';

type Direction = 'ltr' | 'rtl';

const readDirection = (): Direction =>
  getComputedStyle(document.documentElement).direction === 'rtl'
    ? 'rtl'
    : 'ltr';

// One shared observer, with the direction cached so renders don't read styles.
// The cache is dropped when the last Menu unmounts, so it can't go stale.
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
let cached: Direction | undefined;

function subscribeDirection(listener: () => void) {
  if (listeners.size === 0) {
    observer = new MutationObserver(() => {
      cached = readDirection();
      listeners.forEach((l) => l());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      cached = undefined;
    }
  };
}

const getDirection = (): Direction => (cached ??= readDirection());

/** `Menu`'s props. */
export interface MenuProps {
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * A list of actions anchored to its trigger. Compose it from `MenuTrigger` and
 * `MenuContent`. It's non-modal: the page keeps scrolling while it's open.
 * Keyboard direction follows `dir` on the document root; a `dir` on a subtree isn't followed.
 */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  // Base UI picks the submenu arrow keys from a React context, not from the
  // DOM, so without this ArrowRight would open submenus in RTL too.
  const direction = useSyncExternalStore(
    subscribeDirection,
    getDirection,
    (): Direction => 'ltr',
  );
  return (
    <DirectionProvider direction={direction}>
      <BaseMenu.Root
        modal={false}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
      >
        {children}
      </BaseMenu.Root>
    </DirectionProvider>
  );
}
