'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import {
  toBaseOptions,
  type ToastData,
  type ToastOptions,
} from './toastOptions';

/** The same methods whether called from a component or outside React. */
export interface ToastManager {
  /** Shows a toast and returns its id. */
  add(options: ToastOptions): string;
  /** Changes an open toast. */
  update(id: string, options: ToastOptions): void;
  /** Closes one toast, or all of them without an id. */
  close(id?: string): void;
  /** Ties one toast to a promise. */
  promise<T>(promise: Promise<T>, states: ToastPromiseStates<T>): Promise<T>;
}

type State<V> = string | ToastOptions | ((value: V) => string | ToastOptions);

/** The toast for each stage of a promise. A string is the title. */
export interface ToastPromiseStates<T> {
  loading: string | ToastOptions;
  success: State<T>;
  error: State<unknown>;
}

type BaseManager = ReturnType<typeof BaseToast.createToastManager<ToastData>>;
type BaseMethods = Pick<BaseManager, 'add' | 'update' | 'close'>;

const bases = new WeakMap<ToastManager, BaseManager>();

/** The Base UI manager behind one of ours, for `ToastProvider`. */
export function baseManagerOf(manager: ToastManager): BaseManager | undefined {
  return bases.get(manager);
}

/** Wraps Base UI's methods so the options use this library's names. */
export function wrapManager(base: BaseMethods): ToastManager {
  return {
    add: (options) => base.add(toBaseOptions(options)),
    update: (id, options) => {
      const next = toBaseOptions(options);
      // Only what the caller named changes.
      const changes: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(next)) {
        if (value !== undefined && key !== 'id') changes[key] = value;
      }
      if (options.tone === undefined) {
        delete changes.type;
        delete changes.priority;
        delete changes.data;
      }
      const retimed =
        options.duration !== undefined ||
        options.tone !== undefined ||
        options.action !== undefined;
      if (retimed) {
        // An own `timeout: undefined` makes Base UI fall back to the
        // provider's duration, so an old 0 doesn't stick.
        changes.timeout = next.timeout;
      } else {
        delete changes.timeout;
      }
      base.update(id, changes);
    },
    close: (id) => base.close(id),
    promise: () => {
      throw new Error('toast.promise is not implemented yet');
    },
  };
}

/**
 * A manager for code outside React. Create it once, and pass it to
 * `ToastProvider` as `manager`.
 */
export function createToastManager(): ToastManager {
  const base = BaseToast.createToastManager<ToastData>();
  const manager = wrapManager(base);
  bases.set(manager, base);
  return manager;
}
