import type { CSSProperties } from 'react';
import { box } from '../components/Box';
import {
  gridCountStyle,
  withGridVariables,
} from '../components/Box/gridCounts';
import type { LayoutProps } from '../components/Box/types';
import { cx } from './cx';

/**
 * Layout props as a class and an inline style, for components that render an
 * element they can't wrap in `Box`. The grid counts come back as classes plus
 * variables in `style`, with the consumer's `style` merged after them, so it
 * can override them. A function `style` (Base UI parts take one) stays a
 * function. Not exported from the package.
 */
export function layoutStyle<S>(
  layout: LayoutProps,
  style: S,
  component: string,
): { className: string; style: S | CSSProperties | undefined } {
  const { gridColumn, gridRow, ...rest } = layout;
  const grid = gridCountStyle({ gridColumn, gridRow }, component);
  return {
    className: cx(box(rest), grid.className),
    style: withGridVariables(grid.style, style),
  };
}
