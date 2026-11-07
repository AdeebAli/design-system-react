import { tokenToVarName } from '../themes/varName';
import type { Theme, ThemeOverrides } from './defineTheme';
import { validateTheme } from './validateTheme';

function declarations(node: unknown, path: string[] = []): string[] {
  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return declarations(value, [...path, key]);
      }
      // A missing value keeps Soft's, rather than writing "undefined".
      if (typeof value !== 'string' && typeof value !== 'number') return [];
      return [`${tokenToVarName([...path, key])}:${String(value)}`];
    },
  );
}

function body(overrides: ThemeOverrides | undefined) {
  return overrides ? declarations(overrides).join(';') : '';
}

function modeRules(mode: 'light' | 'dark', overrides?: ThemeOverrides) {
  const content = body(overrides);
  if (!content) return '';
  return (
    `:root[data-ds-mode='${mode}']{${content}}` +
    `@media (prefers-color-scheme: ${mode}){:root:not([data-ds-mode]){${content}}}`
  );
}

// The built-in reduced motion rule is layered, so any unlayered duration
// override beats it. This restores it, last and at the mode rules' specificity
// (Spec 02: no exceptions).
const REDUCED_MOTION =
  '@media (prefers-reduced-motion: reduce){:root:not([data-ds-mode]),:root[data-ds-mode]{--ds-motion-duration-fast:0ms;--ds-motion-duration-base:0ms;--ds-motion-duration-slow:0ms}}';

function setsDuration(overrides: ThemeOverrides | undefined) {
  const durations = overrides?.motion?.duration;
  return durations ? Object.values(durations).some((v) => v != null) : false;
}

/**
 * The theme as unlayered CSS. A light value needs its own mode selectors, since
 * an unlayered :root rule would also beat the built-in dark values (Spec 03).
 */
export function themeToCss(theme: Theme): string {
  // A Theme can be a plain object, such as one passed from a server component,
  // so it's validated here as well as in defineTheme.
  validateTheme(theme);
  const shared = body(theme.shared);
  return [
    shared ? `:root{${shared}}` : '',
    modeRules('light', theme.light),
    modeRules('dark', theme.dark),
    [theme.shared, theme.light, theme.dark].some(setsDuration)
      ? REDUCED_MOTION
      : '',
  ].join('');
}
