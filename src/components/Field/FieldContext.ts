'use client';

import { createContext, useContext, useLayoutEffect } from 'react';

/** How a control wants `Field`'s label to behave (Spec 09). */
export type FieldControlKind = 'native' | 'button' | 'choice';

export interface FieldContextValue {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  hasLabel: boolean;
  setKind: (kind: FieldControlKind) => void;
  /** Lets a control that Base UI's label can't focus, such as a group, focus itself. */
  focusRef: { current: (() => void) | null };
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldControlState {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  /** Whether a surrounding `Field` has a label. */
  hasFieldLabel: boolean;
  /** Whether the control is inside a `Field`. */
  inField: boolean;
}

/**
 * Reads the surrounding `Field`, and tells it what kind of control this is.
 * A `button` control gets a non-`label` label, so a click focuses it without
 * activating it. Outside a `Field`, everything is `false`.
 */
export function useFieldControl(
  kind: FieldControlKind,
  focus?: () => void,
): FieldControlState {
  const field = useContext(FieldContext);
  const setKind = field?.setKind;
  const focusRef = field?.focusRef;
  // A layout effect, so the label switches before the first paint.
  useLayoutEffect(() => {
    setKind?.(kind);
  }, [setKind, kind]);
  useLayoutEffect(() => {
    if (!focusRef || !focus) return;
    focusRef.current = focus;
    return () => {
      focusRef.current = null;
    };
  }, [focusRef, focus]);
  return {
    invalid: field?.invalid ?? false,
    disabled: field?.disabled ?? false,
    required: field?.required ?? false,
    hasFieldLabel: field?.hasLabel ?? false,
    inField: field != null,
  };
}
