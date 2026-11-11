'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import {
  toBaseOptions,
  type ToastData,
  type ToastOptions,
  type ToastTone,
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
  loading: string | ToastOptions | (() => string | ToastOptions);
  success: State<T>;
  error: State<unknown>;
}

type BaseManager = ReturnType<typeof BaseToast.createToastManager<ToastData>>;
type BaseMethods = Pick<BaseManager, 'add' | 'update' | 'close'>;

interface Link {
  base: BaseManager;
  /** Marks a provider as subscribed, replays what was queued, and returns the undo. */
  connect(): () => void;
}

const links = new WeakMap<ToastManager, Link>();

/** The Base UI manager behind one of ours, for `ToastProvider`. */
export function baseManagerOf(manager: ToastManager): BaseManager | undefined {
  return links.get(manager)?.base;
}

/**
 * Called from `ToastProvider`'s own effect, which runs after Base UI's
 * subscription effect (a parent's effects run after its children's). Until
 * then the manager queues its calls, and this replays them in order.
 */
export function connectToastManager(manager: ToastManager): () => void {
  return links.get(manager)?.connect() ?? (() => {});
}

let nextId = 0;

const asOptions = (state: string | ToastOptions): ToastOptions =>
  typeof state === 'string' ? { title: state } : state;

/**
 * Changes an open toast. The timeout comes from the toast's merged state, so
 * changing the tone doesn't lose an `action` or a `duration` set earlier.
 * `replace` swaps in a whole new set of options instead of merging, for a
 * promise's result. Base UI ignores a toast that is gone or closing.
 */
function updateToast(
  base: BaseMethods,
  id: string,
  options: ToastOptions,
  replace = false,
) {
  base.update(id, (prev) => {
    const before = prev.data?.given ?? {};
    const given = replace
      ? {
          tone: options.tone,
          action: options.action,
          duration: options.duration,
        }
      : {
          tone: options.tone ?? before.tone,
          action: options.action ?? before.action,
          duration: options.duration ?? before.duration,
        };
    const next = toBaseOptions({ ...given });
    const changes: Record<string, unknown> = {
      // Base UI shallow-merges `data`, so keep what else it holds (`loading`).
      data: replace
        ? { tone: next.data.tone, given }
        : { ...prev.data, tone: next.data.tone, given },
    };
    if (replace || options.title !== undefined) changes.title = options.title;
    if (replace || options.description !== undefined) {
      changes.description = options.description;
    }
    if (replace || options.tone !== undefined) {
      changes.type = next.type;
      changes.priority = next.priority;
    }
    if (replace || options.action !== undefined) {
      changes.actionProps = next.actionProps;
    }
    // Naming `timeout` restarts the timer. An own `undefined` makes Base UI
    // use the provider's duration, so an old 0 doesn't stick.
    if (
      replace ||
      options.duration !== undefined ||
      options.tone !== undefined ||
      options.action !== undefined
    ) {
      changes.timeout = next.timeout;
    }
    return changes;
  });
}

/** Wraps Base UI's methods so the options use this library's names. */
export function wrapManager(base: BaseMethods): ToastManager {
  return {
    add: (options) => base.add(toBaseOptions(options)),
    update: (id, options) => updateToast(base, id, options),
    close: (id) => base.close(id),
    promise: (promise, states) => {
      const loading = asOptions(
        typeof states.loading === 'function'
          ? states.loading()
          : states.loading,
      );
      // The loading toast never times out, whatever its state says.
      const id = base.add({
        ...toBaseOptions({ ...loading, duration: 0 }, undefined, true),
      });
      const settle = (state: string | ToastOptions, tone: ToastTone) =>
        updateToast(base, id, { tone, ...asOptions(state) }, true);
      // A throwing state function must not leave the loading toast stuck.
      const fail = (error: unknown) => {
        try {
          settle(
            typeof states.error === 'function'
              ? states.error(error)
              : states.error,
            'danger',
          );
        } catch (thrown) {
          settle(
            { title: thrown instanceof Error ? thrown.message : 'Failed' },
            'danger',
          );
        }
      };
      promise.then((value) => {
        let state: string | ToastOptions;
        try {
          state =
            typeof states.success === 'function'
              ? states.success(value)
              : states.success;
        } catch (thrown) {
          // The `error` state describes it best: something went wrong.
          fail(thrown);
          return;
        }
        settle(state, 'success');
      }, fail);
      return promise;
    },
  };
}

/**
 * A manager for code outside React. Create it once, and pass it to
 * `ToastProvider` as `manager`.
 */
export function createToastManager(): ToastManager {
  const base = BaseToast.createToastManager<ToastData>();
  // Base UI drops a call nobody is subscribed to, and subscribes in the
  // provider's effect, after every descendant's mount effect has run. So hold
  // the calls until our provider says it's connected.
  const queue: Array<() => void> = [];
  let connections = 0;
  const run = (call: () => void) => {
    if (connections > 0) call();
    else queue.push(call);
  };
  const manager = wrapManager({
    // Base UI accepts a caller's id, so `add` can return it before it runs.
    add: (options) => {
      const id = options.id ?? `ds-toast-${nextId++}`;
      run(() => base.add({ ...options, id }));
      return id;
    },
    update: (id, updates) => run(() => base.update(id, updates)),
    close: (id) => run(() => base.close(id)),
  });
  links.set(manager, {
    base,
    connect() {
      connections += 1;
      // Calls made while replaying run in line, after what was queued.
      while (queue.length > 0 && connections > 0) {
        try {
          queue.shift()!();
        } catch (error) {
          queueMicrotask(() => {
            throw error;
          });
        }
      }
      let connected = true;
      return () => {
        if (!connected) return;
        connected = false;
        connections -= 1;
      };
    },
  });
  return manager;
}
