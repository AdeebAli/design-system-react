import type { Direction } from '../overlays/direction';

/** The edge a drawer opens from. `start` and `end` follow text direction. */
export type DrawerSide = 'start' | 'end' | 'bottom';

/**
 * Base UI's swipe direction is physical: toward the edge the drawer sits on.
 * `start` is the left edge in `ltr` and the right edge in `rtl`.
 */
export function toSwipeDirection(
  side: DrawerSide,
  dir: Direction,
): 'left' | 'right' | 'down' {
  if (side === 'bottom') return 'down';
  return (side === 'start') === (dir === 'ltr') ? 'left' : 'right';
}
