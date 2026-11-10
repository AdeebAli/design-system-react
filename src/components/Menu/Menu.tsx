'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useSyncExternalStore, type ReactNode } from 'react';

type Direction = 'ltr' | 'rtl';

const documentDirection = (): Direction =>
  getComputedStyle(document.documentElement).direction === 'rtl'
    ? 'rtl'
    : 'ltr';

const noop = () => undefined;
const subscribeNothing = () => noop;

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
 */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  // Base UI picks the submenu arrow keys from a React context, not from the
  // DOM, so without this ArrowRight would open submenus in RTL too.
  const direction = useSyncExternalStore(
    subscribeNothing,
    documentDirection,
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
