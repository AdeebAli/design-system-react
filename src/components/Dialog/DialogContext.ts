'use client';

import { createContext, useContext, useLayoutEffect } from 'react';

/** The named parts a dialog can warn about when they're missing. */
export type DialogPart = 'title' | 'description' | 'close';

export interface DialogContextValue {
  alert: boolean;
  /** Counts a mounted part. Returns the function that uncounts it. */
  register: (part: DialogPart) => () => void;
  /** Whether at least one of the part is mounted. */
  has: (part: DialogPart) => boolean;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(component: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Dialog.`);
  }
  return context;
}

/** Registers a part for as long as it's mounted, before any effects read it. */
export function useRegisterPart(
  register: DialogContextValue['register'],
  part: DialogPart,
) {
  useLayoutEffect(() => register(part), [register, part]);
}
