import type { ThemeTokens } from '../themes/types';
import { validateTheme } from './validateTheme';

type Overrides<T, V = string> = {
  [K in keyof T]?: T[K] extends string ? V : Overrides<T[K], V>;
};

type Unitless = string | number;

/** Token overrides. Anything left out keeps Soft's value. */
export type ThemeOverrides = Overrides<Omit<ThemeTokens, 'font' | 'zIndex'>> & {
  font?: Overrides<Omit<ThemeTokens['font'], 'weight' | 'lineHeight'>> & {
    weight?: Overrides<ThemeTokens['font']['weight'], Unitless>;
    lineHeight?: Overrides<ThemeTokens['font']['lineHeight'], Unitless>;
  };
  zIndex?: Overrides<ThemeTokens['zIndex'], Unitless>;
};

declare const themeBrand: unique symbol;

/** A theme from `defineTheme` or `defineFullTheme`. Pass it to `ThemeProvider`. */
export interface Theme {
  readonly [themeBrand]?: never;
  readonly shared?: ThemeOverrides;
  readonly light?: ThemeOverrides;
  readonly dark?: ThemeOverrides;
}

/** Builds a theme from token overrides. Mode values beat `shared`, which beats Soft. */
export function defineTheme(input: {
  shared?: ThemeOverrides;
  light?: ThemeOverrides;
  dark?: ThemeOverrides;
}): Theme {
  validateTheme(input);
  return input;
}

/** Builds a theme with every token set, in both modes. */
export function defineFullTheme(input: {
  light: ThemeTokens;
  dark: ThemeTokens;
}): Theme {
  validateTheme(input);
  return input;
}
