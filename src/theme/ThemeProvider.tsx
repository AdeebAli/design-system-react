'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { warnOnce } from '../utils/warn';
import {
  createColorModeStore,
  type ColorMode,
  type ColorModeStore,
  type ResolvedColorMode,
} from './colorModeStore';
import type { Theme } from './defineTheme';
import { themeToCss } from './themeToCss';

export type { ColorMode, ResolvedColorMode };

const ThemeContext = createContext<ColorModeStore | null>(null);

export interface ThemeProviderProps {
  /** Used only when no choice is stored. @default 'system' */
  defaultMode?: ColorMode;
  /** Locks the mode. The stored choice is left untouched. */
  forcedMode?: ResolvedColorMode;
  /** Token overrides or a full theme, from `defineTheme` or `defineFullTheme`. */
  theme?: Theme;
  /** The `localStorage` key. Must match `ColorModeScript`. @default 'ds-color-mode' */
  storageKey?: string;
  /** For strict Content Security Policies. Applied to the theme `style` element. */
  nonce?: string;
  children?: ReactNode;
}

const ATTRIBUTE = 'data-ds-mode';

// Stops components animating at different speeds during a mode change.
function suppressTransitions(nonce: string | undefined) {
  const style = document.createElement('style');
  if (nonce) style.nonce = nonce;
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => style.remove());
  });
}

function applyMode(mode: ColorMode, nonce: string | undefined) {
  const root = document.documentElement;
  const next = mode === 'system' ? null : mode;
  if (root.getAttribute(ATTRIBUTE) === next) return;
  suppressTransitions(nonce);
  if (next === null) root.removeAttribute(ATTRIBUTE);
  else root.setAttribute(ATTRIBUTE, next);
}

/** Applies color mode and theme overrides. Place one at the app root. */
export function ThemeProvider(props: ThemeProviderProps) {
  const parent = useContext(ThemeContext);
  if (parent) {
    warnOnce(
      'nested-theme-provider',
      'ThemeProvider was nested inside another one, so the inner one does nothing. Theme variables live on the root, and nesting can’t scope them. To lock the mode on certain routes, compute forcedMode at the root provider.',
    );
    return <>{props.children}</>;
  }
  return <RootProvider {...props} />;
}

function RootProvider({
  defaultMode = 'system',
  forcedMode,
  theme,
  storageKey = 'ds-color-mode',
  nonce,
  children,
}: ThemeProviderProps) {
  const store = useMemo(
    () => createColorModeStore({ storageKey, defaultMode, forcedMode }),
    [storageKey, defaultMode, forcedMode],
  );

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute(ATTRIBUTE);
    applyMode(store.getMode(), nonce);
    const unsubscribe = store.subscribe(() =>
      applyMode(store.getMode(), nonce),
    );
    return () => {
      unsubscribe();
      if (previous === null) root.removeAttribute(ATTRIBUTE);
      else root.setAttribute(ATTRIBUTE, previous);
    };
  }, [store, nonce]);

  const css = useMemo(() => (theme ? themeToCss(theme) : ''), [theme]);

  return (
    <ThemeContext.Provider value={store}>
      {css ? (
        // React may escape quotes in style children during server rendering.
        // This is safe because defineTheme rejects "<".
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      ) : null}
      {children}
    </ThemeContext.Provider>
  );
}

export interface UseColorModeResult {
  /** The current setting. */
  mode: ColorMode;
  /** What's on screen. `undefined` during server rendering and hydration. */
  resolvedMode: ResolvedColorMode | undefined;
  /** Stores the choice, including `'system'`. Does nothing when forced. */
  setMode: (mode: ColorMode) => void;
  /** True when `forcedMode` is set, so a toggle can hide itself. */
  isForced: boolean;
}

/** Reads and sets the color mode. Only components calling it re-render on a change. */
export function useColorMode(): UseColorModeResult {
  const store = useContext(ThemeContext);
  if (!store) {
    throw new Error('useColorMode must be used inside a ThemeProvider.');
  }

  const mode = useSyncExternalStore(
    store.subscribe,
    store.getMode,
    store.serverMode,
  );
  const resolvedMode = useSyncExternalStore(
    store.subscribe,
    store.getResolved,
    () => undefined,
  );

  const setMode = useCallback(
    (next: ColorMode) => {
      if (store.isForced) {
        warnOnce(
          'set-mode-forced',
          'setMode was called while forcedMode is set, so it did nothing. Check isForced before offering a toggle.',
        );
        return;
      }
      store.setMode(next);
    },
    [store],
  );

  return { mode, resolvedMode, setMode, isForced: store.isForced };
}
