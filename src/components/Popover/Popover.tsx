'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useMemo, useRef, type ReactNode } from 'react';
import { OverlayDirection } from '../overlays/direction';
import { PopoverContext, type PopoverContextValue } from './PopoverContext';

/** `Popover`'s props. */
export interface PopoverProps {
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  /** A `PopoverTrigger` and a `PopoverContent`. */
  children?: ReactNode;
}

/** A non-modal popup anchored to its trigger. Compose it from `PopoverTrigger` and `PopoverContent`. */
export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  const titles = useRef(0);
  const context = useMemo<PopoverContextValue>(
    () => ({
      registerTitle: () => {
        titles.current += 1;
        return () => {
          titles.current -= 1;
        };
      },
      hasTitle: () => titles.current > 0,
    }),
    [],
  );
  return (
    <PopoverContext.Provider value={context}>
      <OverlayDirection>
        <BasePopover.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={(next) => onOpenChange?.(next)}
        >
          {children}
        </BasePopover.Root>
      </OverlayDirection>
    </PopoverContext.Provider>
  );
}
