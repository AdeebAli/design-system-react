'use client';

import { createContext, useContext, useLayoutEffect } from 'react';

/** The named parts a drawer can warn about when they're missing. */
export type DrawerPart = 'trigger' | 'title' | 'description' | 'close';

export interface DrawerContextValue {
  /** Whether `open` is set, so the caller owns the state. */
  controlled: boolean;
  /** Counts a mounted part. Returns the function that uncounts it. */
  register: (part: DrawerPart) => () => void;
  /** Whether at least one of the part is mounted. */
  has: (part: DrawerPart) => boolean;
  /** Sets the physical swipe direction on Base UI's root. */
  setSwipeDirection: (direction: 'left' | 'right' | 'down') => void;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(component: string): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Drawer.`);
  }
  return context;
}

/** Registers a part for as long as it's mounted, before any effects read it. */
export function useRegisterPart(
  register: DrawerContextValue['register'],
  part: DrawerPart,
) {
  useLayoutEffect(() => register(part), [register, part]);
}
