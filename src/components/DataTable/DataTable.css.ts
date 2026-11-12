import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The outer element: the table, then `Pagination` beneath it. */
export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['3'],
  }),
);

/** The toolbar above a `multiple` table. */
export const toolbar = style(
  layered({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: vars.space['2'],
  }),
);

export const count = style(
  layered({
    fontSize: vars.font.size.sm,
    color: vars.color.fg.muted,
  }),
);

/** A row with `selectOnRowClick`: the button stays the keyboard route. */
export const clickableRow = style(layered({ cursor: 'pointer' }));

// WCAG 2.5.8's minimum target size.
const MIN_TARGET = '1.5rem';

/** The row header's content as a toggle button, dotted underline until hover. */
export const selectButton = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['1'],
    boxSizing: 'border-box',
    minBlockSize: MIN_TARGET,
    verticalAlign: 'top',
    // The target is taller than a line of text. The negative margin lets it
    // overlap the cell's padding, so rows keep the height a `Table` row has.
    // Depends on Table.css.ts cell metrics: `font.size.sm` and `lineHeight.normal`.
    marginBlock: `min(0rem, calc((${vars.font.size.sm} * ${vars.font.lineHeight.normal} - ${MIN_TARGET}) / 2))`,
    marginInline: 0,
    padding: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    letterSpacing: 'inherit',
    textTransform: 'inherit',
    textAlign: 'inherit',
    // A disabled button is also the row's name, so it keeps the text color.
    color: 'inherit',
    cursor: 'pointer',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '0.2em',
    selectors: {
      '&:disabled': { cursor: 'default' },
    },
    '@media': {
      '(hover: hover)': {
        selectors: {
          '&:hover:not(:disabled)': { textDecorationStyle: 'solid' },
        },
      },
    },
  }),
);
