import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg } = vars.color;

/** An item with a check indicator, so the menu reserves a column for it. */
export const checkable = style({});

export const popup = style(
  layered({
    padding: vars.space['1'],
    maxBlockSize: 'var(--available-height)',
    overflowY: 'auto',
    outline: 'none',
  }),
);

/**
 * Every item, including `MenuSubmenuTrigger`. In a menu with checkable items,
 * the other items get an empty column the width of the indicator, so labels
 * line up. `:has()` does this without React state.
 */
export const menuItem = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    boxSizing: 'border-box',
    // At least 2rem (a comfortable target), but never taller than a medium control.
    // `control.sm` only keeps the floor from shrinking below the theme's smallest control.
    minBlockSize: `min(${vars.size.control.md}, max(2rem, ${vars.size.control.sm}))`,
    paddingInline: vars.space['2'],
    borderRadius: vars.radius.md,
    fontSize: vars.font.size.md,
    color: fg.default,
    textDecoration: 'none',
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    selectors: {
      [`${popup}:has(${checkable}) &:not(${checkable})::before`]: {
        content: '""',
        flexShrink: 0,
        inlineSize: vars.size.icon.md,
      },
      '&[data-highlighted]': { background: bg.muted },
      '&[data-disabled]': { color: fg.disabled, cursor: 'not-allowed' },
    },
    // A system highlight, since backgrounds are replaced in forced colors.
    '@media': {
      '(forced-colors: active)': {
        selectors: {
          '&[data-highlighted]': {
            outline: '2px solid Highlight',
            outlineOffset: '-2px',
          },
        },
      },
    },
  }),
);

export const danger = style(
  layered({
    color: fg.danger,
    selectors: {
      '&[data-highlighted]': { background: bg.dangerSubtle },
    },
  }),
);

export const itemIcon = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    inlineSize: vars.size.icon.md,
    blockSize: vars.size.icon.md,
    color: 'inherit',
  }),
);

/** A fixed-width slot, so unchecked items keep their label aligned. */
export const indicatorSlot = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    inlineSize: vars.size.icon.md,
    blockSize: vars.size.icon.md,
    color: fg.accent,
  }),
);

export const indicator = style(
  layered({ display: 'inline-flex', inlineSize: '100%', blockSize: '100%' }),
);

export const group = style(
  layered({ display: 'flex', flexDirection: 'column' }),
);

export const groupLabel = style(
  layered({
    paddingBlock: vars.space['1'],
    paddingInline: vars.space['2'],
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    color: fg.muted,
  }),
);

export const separator = style(
  layered({
    marginBlock: vars.space['1'],
    marginInline: vars.space['2'],
    blockSize: '1px',
    border: 'none',
    background: vars.color.border.subtle,
  }),
);
