'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useMemo, useRef, type ReactNode } from 'react';
import { warnOnce } from '../../utils/warn';
import {
  DialogContext,
  type DialogContextValue,
  type DialogPart,
} from './DialogContext';

/** `Dialog`'s props. */
export interface DialogProps {
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Confirms something destructive: `role="alertdialog"`, no close button, and
   * clicking outside doesn't close it. Static: changing it remounts the dialog.
   * @default false
   */
  alert?: boolean;
  /** Whether clicking outside closes it. Ignored with `alert`. @default true */
  closeOnOutsideClick?: boolean;
  children?: ReactNode;
}

/** A modal dialog. Compose it from `DialogTrigger` and `DialogContent`. */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  alert = false,
  closeOnOutsideClick,
  children,
}: DialogProps) {
  const counts = useRef<Record<DialogPart, number>>({
    title: 0,
    description: 0,
    close: 0,
  });
  const context = useMemo<DialogContextValue>(
    () => ({
      alert,
      register: (part) => {
        counts.current[part] += 1;
        return () => {
          counts.current[part] -= 1;
        };
      },
      has: (part) => counts.current[part] > 0,
    }),
    [alert],
  );
  const handleOpenChange = (next: boolean) => onOpenChange?.(next);

  if (alert && closeOnOutsideClick !== undefined) {
    warnOnce(
      'dialog-alert-outside-click',
      'Dialog: `closeOnOutsideClick` is ignored with `alert`, which never closes on an outside click. Remove it, or drop `alert` if clicking outside should be configurable.',
    );
  }

  return (
    <DialogContext.Provider value={context}>
      {alert ? (
        <AlertDialog.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={handleOpenChange}
        >
          {children}
        </AlertDialog.Root>
      ) : (
        <BaseDialog.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={handleOpenChange}
          disablePointerDismissal={closeOnOutsideClick === false}
        >
          {children}
        </BaseDialog.Root>
      )}
    </DialogContext.Provider>
  );
}
