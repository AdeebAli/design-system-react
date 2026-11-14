'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';

/** `MenuSubmenu`'s props. */
export interface MenuSubmenuProps {
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  /** Ignores interaction and can't be opened. @default false */
  disabled?: boolean;
  /** A `MenuSubmenuTrigger` and a `MenuSubmenuContent`. */
  children?: ReactNode;
}

/**
 * A nested menu. Compose it from `MenuSubmenuTrigger` and `MenuSubmenuContent`
 * inside a `MenuContent`. Nest sparingly: they're hard to use on touch screens.
 */
export function MenuSubmenu({
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  children,
}: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot
      open={open}
      defaultOpen={defaultOpen}
      disabled={disabled}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {children}
    </BaseMenu.SubmenuRoot>
  );
}
