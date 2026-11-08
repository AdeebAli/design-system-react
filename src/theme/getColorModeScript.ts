import type { ColorMode, ResolvedColorMode } from './colorModeStore';

export interface ColorModeScriptOptions {
  /** Used only when no choice is stored. @default 'system' */
  defaultMode?: ColorMode;
  /** Locks the mode. */
  forcedMode?: ResolvedColorMode;
  /** The `localStorage` key. Must match `ThemeProvider`. @default 'ds-color-mode' */
  storageKey?: string;
}

/**
 * The inline script that applies a stored choice or lock before first paint.
 * For setups without React on the server, such as a Vite app's index.html.
 */
export function getColorModeScript({
  defaultMode = 'system',
  forcedMode,
  storageKey = 'ds-color-mode',
}: ColorModeScriptOptions = {}): string {
  // Escaped, so a value can't close the script element.
  const json = (value: unknown) =>
    JSON.stringify(value ?? null).replace(/</g, '\\u003c');
  return (
    `(function(){var m=${json(forcedMode)};` +
    `if(!m){try{var s=localStorage.getItem(${json(storageKey)});` +
    `if(s==="system"||s==="light"||s==="dark")m=s}catch(e){}}` +
    `m=m||${json(defaultMode)};` +
    `if(m==="light"||m==="dark")document.documentElement.setAttribute("data-ds-mode",m)})()`
  );
}
