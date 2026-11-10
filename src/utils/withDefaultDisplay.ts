import type { DisplayValue, Responsive } from '../components/Box/types';

/**
 * Applies a component's default for a responsive prop. A responsive value with
 * no `base` keeps the default below its first breakpoint (Spec 06).
 */
export function withDefault<T extends string>(
  value: Responsive<T> | undefined,
  fallback: T,
): Responsive<T> {
  if (value == null) return fallback;
  if (typeof value !== 'object') return value;
  return { ...value, base: value.base ?? fallback };
}

/** Applies a layout component's default `display`. */
export function withDefaultDisplay(
  display: Responsive<DisplayValue> | undefined,
  fallback: DisplayValue,
): Responsive<DisplayValue> {
  return withDefault(display, fallback);
}
