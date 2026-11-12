import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { breakpoints } from '../../tokens/breakpoints';
import { layered } from '../../utils/recipe';

const sm = `screen and (min-width: ${breakpoints.sm})`;
// Everything sm doesn't match, so the compact rule can't override sm's.
const belowSm = `not all and (min-width: ${breakpoints.sm})`;

export const root = style(layered({ display: 'block' }));

const list = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['1'],
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

/** The full list. Hidden below `sm`. */
export const full = style(
  layered({
    ...list,
    '@media': { [belowSm]: { display: 'none' } },
  }),
);

/** Previous, status, and next. Hidden from `sm`. */
export const compact = style(
  layered({
    ...list,
    justifyContent: 'space-between',
    '@media': { [sm]: { display: 'none' } },
  }),
);

export const ellipsis = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minInlineSize: vars.space['6'],
    color: vars.color.fg.muted,
    userSelect: 'none',
  }),
);

/** Square at the button's control height, growing only for long numbers. */
export const page = style(layered({ paddingInline: 0, aspectRatio: '1' }));

/** The current page: weight separates it from a hovered page. */
export const current = style(
  layered({ fontWeight: vars.font.weight.semibold }),
);

/** Chevrons point the other way in a right-to-left context. */
export const chevron = style(
  layered({ selectors: { '&:dir(rtl)': { transform: 'scaleX(-1)' } } }),
);
