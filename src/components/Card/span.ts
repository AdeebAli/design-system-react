import type { GridSpanValue, Responsive } from '../Box/types';

/** Card sizes, as columns × rows. */
export type CardSpan = '1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '4x1' | 'full';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

interface GridPlacement {
  gridColumn?: Responsive<GridSpanValue>;
  gridRow?: Responsive<GridSpanValue>;
}

function axes(span: CardSpan): [GridSpanValue, GridSpanValue] {
  if (span === 'full') return ['full', 'span-1'];
  const [columns, rows] = span.split('x') as [string, string];
  return [`span-${columns}`, `span-${rows}`] as [GridSpanValue, GridSpanValue];
}

/**
 * Maps `span` to grid placement (Spec 08). A fixed span wider than one column
 * fills the row below `md`, so it can't overflow a narrow grid. A responsive
 * span is taken literally.
 */
export function spanToGrid(
  span: Responsive<CardSpan> | undefined,
): GridPlacement {
  if (span == null) return {};
  if (typeof span === 'string') {
    if (span === 'full') return { gridColumn: 'full' };
    const [column, row] = axes(span);
    const placement: GridPlacement = {};
    if (column !== 'span-1')
      placement.gridColumn = { base: 'full', md: column };
    if (row !== 'span-1') placement.gridRow = row;
    return placement;
  }
  const gridColumn: Partial<Record<Breakpoint, GridSpanValue>> = {};
  const gridRow: Partial<Record<Breakpoint, GridSpanValue>> = {};
  for (const [breakpoint, value] of Object.entries(span) as [
    Breakpoint,
    CardSpan | undefined,
  ][]) {
    if (value == null) continue;
    const [column, row] = axes(value);
    gridColumn[breakpoint] = column;
    // A full-width card keeps whatever rows a smaller breakpoint set.
    if (value !== 'full') gridRow[breakpoint] = row;
  }
  return { gridColumn, gridRow };
}
