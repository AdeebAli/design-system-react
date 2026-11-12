'use client';

import { createContext, useContext, useLayoutEffect } from 'react';

export interface PopoverContextValue {
  /** Counts a mounted `PopoverTitle`. Returns the function that uncounts it. */
  registerTitle: () => () => void;
  /** Whether at least one `PopoverTitle` is mounted. */
  hasTitle: () => boolean;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(component: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Popover.`);
  }
  return context;
}

/** Registers a title for as long as it's mounted, before any effects read it. */
export function useRegisterTitle(
  register: PopoverContextValue['registerTitle'],
) {
  useLayoutEffect(() => register(), [register]);
}
