'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { useEffect, type ReactNode } from 'react';
import {
  baseManagerOf,
  connectToastManager,
  type ToastManager,
} from './createToastManager';
import * as styles from './Toast.css';
import { ToastList } from './ToastList';
import type { ToastPosition } from './toastOptions';
import { ToastScope } from './useToast';

/** `ToastProvider`'s props. */
export interface ToastProviderProps {
  /** Where the toasts sit. @default 'bottom-end' */
  position?: ToastPosition;
  /** How many show at once. @default 3 */
  limit?: number;
  /** How long an ordinary toast stays, in ms. @default 5000 */
  duration?: number;
  /** The name of every dismiss button. @default 'Dismiss' */
  closeLabel?: string;
  /** The name of the toast region. @default 'Notifications' */
  viewportLabel?: string;
  /** A manager from `createToastManager`, for code outside React. */
  manager?: ToastManager;
  children?: ReactNode;
}

/** Mount it once, near the root. Toasts show while it's mounted. */
export function ToastProvider({
  position = 'bottom-end',
  limit = 3,
  duration = 5000,
  closeLabel = 'Dismiss',
  viewportLabel = 'Notifications',
  manager,
  children,
}: ToastProviderProps) {
  // After Base UI's own subscription effect, so the manager can replay what
  // descendants queued from their mount effects.
  useEffect(
    () => (manager ? connectToastManager(manager) : undefined),
    [manager],
  );
  return (
    <BaseToast.Provider
      limit={limit}
      timeout={duration}
      toastManager={manager && baseManagerOf(manager)}
    >
      <ToastScope.Provider value>
        {children}
        <BaseToast.Portal>
          <BaseToast.Viewport
            aria-label={viewportLabel}
            className={styles.viewport[position]}
          >
            <ToastList position={position} closeLabel={closeLabel} />
          </BaseToast.Viewport>
        </BaseToast.Portal>
      </ToastScope.Provider>
    </BaseToast.Provider>
  );
}
