import type { DisplayValue, Responsive } from '../components/Box/types';

/**
 * Applies a layout component's default `display`. A responsive value with no
 * `base` keeps the default below its first breakpoint (Spec 06).
 */
export function withDefaultDisplay(
  display: Responsive<DisplayValue> | undefined,
  fallback: DisplayValue,
): Responsive<DisplayValue> {
  if (display == null) return fallback;
  if (typeof display !== 'object') return display;
  return { ...display, base: display.base ?? fallback };
}
