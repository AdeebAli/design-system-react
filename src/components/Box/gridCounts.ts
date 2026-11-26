import type { CSSProperties } from 'react';
import { warnOnce } from '../../utils/warn';
import { gridCountClass, gridCountVar, gridFullClass } from './gridCounts.css';
import type { BoxStyleProps } from './types';

/** The props whose values are counts. They don't come from sprinkles (ADR 0005). */
export type GridCountProps = Pick<
  BoxStyleProps,
  'gridTemplateColumns' | 'gridColumn' | 'gridRow'
>;

export const GRID_COUNT_PROPS = [
  'gridTemplateColumns',
  'gridColumn',
  'gridRow',
] as const satisfies readonly (keyof GridCountProps)[];

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const;

/** A positive whole number, or `'full'` for spans. Anything else is undefined. */
function toCount(value: unknown, span: boolean): number | 'full' | undefined {
  if (span && value === 'full') return 'full';
  let count: number;
  if (typeof value === 'number') count = value;
  else if (typeof value === 'string') {
    const digits = span && value.startsWith('span-') ? value.slice(5) : value;
    if (!/^\d+$/.test(digits)) return undefined;
    count = Number(digits);
  } else return undefined;
  return Number.isSafeInteger(count) && count > 0 ? count : undefined;
}

function show(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  return typeof value === 'number' ? String(value) : typeof value;
}

/**
 * Turns grid counts into classes and the variables they read. Anything that
 * isn't a positive whole number (or `'full'` for spans) logs one development
 * warning and adds nothing.
 */
export function gridCountStyle(
  props: GridCountProps,
  component: string,
): { className: string; style: Record<string, number> | undefined } {
  const classes: string[] = [];
  const variables: Record<string, number> = {};
  for (const prop of GRID_COUNT_PROPS) {
    const value: unknown = props[prop];
    if (value == null) continue;
    const span = prop !== 'gridTemplateColumns';
    const responsive =
      typeof value === 'object'
        ? (value as Record<string, unknown>)
        : { base: value };
    for (const name of breakpoints) {
      const item = responsive[name];
      if (item == null) continue;
      const count = toCount(item, span);
      if (count === 'full') {
        classes.push(gridFullClass[prop as 'gridColumn' | 'gridRow'][name]);
      } else if (count !== undefined) {
        classes.push(gridCountClass[prop][name]);
        variables[gridCountVar[prop][name]] = count;
      } else {
        warnOnce(
          `grid-count:${component}:${prop}:${show(item)}`,
          `${component}: ${prop}=${show(item)} isn't a positive whole number${span ? ' or "full"' : ''}, so it's ignored. Use a count such as ${span ? '14 or "span-14"' : '16 or "16"'}, or set it with style.`,
        );
      }
    }
  }
  return {
    className: classes.join(' '),
    style: Object.keys(variables).length > 0 ? variables : undefined,
  };
}

/**
 * Puts the grid variables under a consumer's `style`, so the consumer wins.
 * A function style (Base UI parts take one) is kept as a function.
 */
export function withGridVariables<S>(
  variables: Record<string, number> | undefined,
  style: S,
): S | CSSProperties {
  if (!variables) return style;
  if (typeof style === 'function') {
    return ((state: unknown) => ({
      ...variables,
      ...(style as (state: unknown) => CSSProperties)(state),
    })) as S;
  }
  return { ...variables, ...(style as CSSProperties | undefined) };
}
