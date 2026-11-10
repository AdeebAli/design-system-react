'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';

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
  return (
    <BaseMenu.Root
      modal={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {children}
    </BaseMenu.Root>
  );
}
