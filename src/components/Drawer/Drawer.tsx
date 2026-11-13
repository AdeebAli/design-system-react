'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DrawerContext,
  type DrawerContextValue,
  type DrawerPart,
} from './DrawerContext';
import { toSwipeDirection } from './swipeDirection';

/** `Drawer`'s props. */
export interface DrawerProps {
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  /** Whether clicking outside closes it. @default true */
  closeOnOutsideClick?: boolean;
  children?: ReactNode;
}

/** A modal panel that slides in from a side. Compose it from `DrawerTrigger` and `DrawerContent`. */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  closeOnOutsideClick,
  children,
}: DrawerProps) {
  const counts = useRef<Record<DrawerPart, number>>({
    trigger: 0,
    title: 0,
    description: 0,
    close: 0,
  });
  // `DrawerContent` sets this when it opens, since it knows the side and direction.
  const [swipeDirection, setSwipeDirection] = useState(
    toSwipeDirection('end', 'ltr'),
  );
  const controlled = open !== undefined;
  const context = useMemo<DrawerContextValue>(
    () => ({
      controlled,
      register: (part) => {
        counts.current[part] += 1;
        return () => {
          counts.current[part] -= 1;
        };
      },
      has: (part) => counts.current[part] > 0,
      setSwipeDirection,
    }),
    [controlled],
  );

  return (
    <DrawerContext.Provider value={context}>
      <BaseDrawer.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        swipeDirection={swipeDirection}
        disablePointerDismissal={closeOnOutsideClick === false}
      >
        {children}
      </BaseDrawer.Root>
    </DrawerContext.Provider>
  );
}
