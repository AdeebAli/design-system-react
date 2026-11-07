import { tokenToVarName } from '../themes/varName';
import type { Theme, ThemeOverrides } from './defineTheme';

function declarations(node: unknown, path: string[] = []): string[] {
  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) =>
      typeof value === 'object' && value !== null
        ? declarations(value, [...path, key])
        : [`${tokenToVarName([...path, key])}:${String(value)}`],
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

/**
 * The theme as unlayered CSS. A light value needs its own mode selectors, since
 * an unlayered :root rule would also beat the built-in dark values (Spec 03).
 */
export function themeToCss(theme: Theme): string {
  const shared = body(theme.shared);
  return [
    shared ? `:root{${shared}}` : '',
    modeRules('light', theme.light),
    modeRules('dark', theme.dark),
  ].join('');
}
