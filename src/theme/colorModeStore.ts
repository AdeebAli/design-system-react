export type ColorMode = 'system' | 'light' | 'dark';
export type ResolvedColorMode = 'light' | 'dark';

interface StoreOptions {
  storageKey: string;
  defaultMode: ColorMode;
  forcedMode?: ResolvedColorMode;
}

function isColorMode(value: unknown): value is ColorMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function prefersDark() {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Holds the color mode outside React, so only components that read it through
 * useSyncExternalStore re-render when it changes. Touches browser APIs only
 * when called from the client.
 */
export function createColorModeStore({
  storageKey,
  defaultMode,
  forcedMode,
}: StoreOptions) {
  const listeners = new Set<() => void>();
  let osQuery: MediaQueryList | undefined;
  // Holds the choice when storage is blocked, and is cleared on storage events.
  let memory: ColorMode | undefined;

  function readStored() {
    try {
      const stored = localStorage.getItem(storageKey);
      return isColorMode(stored) ? stored : undefined;
    } catch {
      return undefined;
    }
  }

  function getMode(): ColorMode {
    return forcedMode ?? memory ?? readStored() ?? defaultMode;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      memory = undefined;
      notify();
    }
  }

  return {
    getMode,
    isForced: forcedMode !== undefined,
    getResolved: (): ResolvedColorMode => {
      const mode = getMode();
      if (mode !== 'system') return mode;
      return prefersDark() ? 'dark' : 'light';
    },
    setMode: (mode: ColorMode) => {
      memory = mode;
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // Blocked storage: the choice lasts for this page only.
      }
      notify();
    },
    subscribe: (listener: () => void) => {
      if (listeners.size === 0) {
        window.addEventListener('storage', onStorage);
        // Each matchMedia call returns a new object, so the same one is kept
        // for removing the listener.
        if (typeof matchMedia === 'function') {
          osQuery = matchMedia('(prefers-color-scheme: dark)');
          osQuery.addEventListener('change', notify);
        }
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.removeEventListener('storage', onStorage);
          osQuery?.removeEventListener('change', notify);
          osQuery = undefined;
        }
      };
    },
    /** What the server renders. It can't know the stored choice or the OS. */
    serverMode: (): ColorMode => {
      return forcedMode ?? defaultMode;
    },
  };
}

export type ColorModeStore = ReturnType<typeof createColorModeStore>;
