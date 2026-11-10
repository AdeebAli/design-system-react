'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { createContext, useContext, useMemo } from 'react';
import { wrapManager, type ToastManager } from './createToastManager';

/** Set by `ToastProvider`, so `useToast` can tell it's missing. */
export const ToastScope = createContext(false);

/** Shows and changes toasts. Needs a `ToastProvider` above it. */
export function useToast(): ToastManager {
  const inside = useContext(ToastScope);
  if (!inside) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  const { add, update, close } = BaseToast.useToastManager();
  return useMemo(
    () => wrapManager({ add, update, close }),
    [add, update, close],
  );
}
