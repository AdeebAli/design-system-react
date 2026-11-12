import { vars } from '../../themes/contract.css';

export type OverlaySide = 'top' | 'bottom' | 'start' | 'end';
export type OverlayAlign = 'start' | 'center' | 'end';

type BaseSide = 'top' | 'bottom' | 'inline-start' | 'inline-end';

export function toBaseSide(side: OverlaySide): BaseSide {
  if (side === 'start') return 'inline-start';
  if (side === 'end') return 'inline-end';
  return side;
}

// `var(--ds-space-1_5)` -> `--ds-space-1_5`, so the name can't drift from the contract.
const GAP_PROPERTY = /^var\((--[^,)]+)/.exec(vars.space['1.5'])![1]!;

/**
 * The popup gap: `space.1.5`, read from the root where theme variables live, so
 * a theme that overrides it is followed. (Base UI's offset callback gets only
 * dimensions, not the positioner element.) Custom properties return their
 * declared value, so `rem` is converted with the root font size. Assignable to
 * Base UI's `sideOffset`.
 */
export const gapOffset = (): number => {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const raw = style.getPropertyValue(GAP_PROPERTY).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith('rem') ? value * parseFloat(style.fontSize) : value;
};
