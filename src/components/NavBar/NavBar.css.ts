import { globalStyle, style } from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { breakpoints } from '../../tokens/breakpoints';
import { layered } from '../../utils/recipe';
import {
  navBarPaddingBlock,
  stickyClearance,
  stickyOffset,
} from '../../styles/sticky';

const md = `screen and (min-width: ${breakpoints.md})`;
// Everything md doesn't match, so a below-md rule can't override md's layout.
const belowMd = `not all and (min-width: ${breakpoints.md})`;

const paddingBlock = navBarPaddingBlock;

/**
 * One grid that rearranges at `md`. Below it, the menu button sits beside the
 * actions and the panel spans the row beneath. From `md`, the panel takes the
 * middle column and the button is hidden.
 */
export const root = style(
  layered({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto auto',
    gridTemplateAreas: '"brand actions menu" "panel panel panel"',
    alignItems: 'center',
    columnGap: vars.space['3'],
    paddingBlock,
    paddingInline: vars.space['3'],
    background: vars.color.bg.surface,
    borderRadius: vars.radius.card,
    boxShadow: vars.shadow.card,
    borderStyle: 'solid',
    borderWidth: vars.borderWidth.thin,
    borderColor: vars.color.border.surface,
    '@media': {
      [md]: {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        gridTemplateAreas: '"brand panel actions"',
        columnGap: vars.space['4'],
      },
    },
  }),
);

/** `menuPosition="start"`: below md, the menu button comes before the brand. */
export const menuStart = style(
  layered({
    '@media': {
      [belowMd]: {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        gridTemplateAreas: '"menu brand actions" "panel panel panel"',
      },
    },
  }),
);

export const sticky = style(
  layered({
    position: 'sticky',
    insetBlockStart: stickyOffset,
    zIndex: vars.zIndex.sticky,
  }),
);

export const brand = style(
  layered({
    gridArea: 'brand',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  }),
);

export const actions = style(
  layered({
    gridArea: 'actions',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
  }),
);

export const menuButton = style(
  layered({
    gridArea: 'menu',
    '@media': { [md]: { display: 'none' } },
  }),
);

export const panel = style(
  layered({
    gridArea: 'panel',
    minWidth: 0,
    selectors: {
      '&[data-open]': { paddingBlockStart: vars.space['2'] },
    },
    '@media': {
      // Shows the list whether or not the panel is open, and before JavaScript.
      [md]: {
        display: 'block',
        height: 'auto',
        paddingBlockStart: 0,
        selectors: { '&[data-open]': { paddingBlockStart: 0 } },
      },
    },
  }),
);

export const list = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
    '@media': {
      [md]: { flexDirection: 'row', alignItems: 'center' },
    },
  }),
);

export const link = style(
  layered({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    // At least 44 CSS pixels tall when stacked, for touch.
    minBlockSize: '2.75rem',
    paddingInline: vars.space['3'],
    borderRadius: vars.radius.control,
    color: vars.color.fg.muted,
    fontSize: vars.font.size.md,
    fontWeight: vars.font.weight.medium,
    textDecorationLine: 'none',
    transitionProperty: 'color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-active]': { color: vars.color.fg.default },
      // The non-color signal for the current page (Spec 05). A border, so
      // forced colors keeps it.
      '&[data-active]::after': {
        content: '""',
        position: 'absolute',
        insetInline: vars.space['3'],
        insetBlockEnd: 0,
        borderBlockEnd: `${vars.borderWidth.thick} solid ${vars.color.bg.accent}`,
      },
    },
    '@media': {
      '(hover: hover)': {
        selectors: { '&:hover': { color: vars.color.fg.default } },
      },
      [md]: { minBlockSize: vars.size.control.md },
    },
  }),
);

export const linkIcon = style(
  layered({ display: 'inline-flex', flexShrink: 0 }),
);

// A sticky bar stays pinned, so an open panel taller than the viewport would
// leave links out of reach. Below md it scrolls instead, with room for focus
// rings, and fits between the bar and the bottom of the viewport.
globalStyle(`${sticky} ${panel}[data-open]`, {
  '@layer': {
    [componentsLayer]: {
      maxBlockSize: `calc(100dvh - ${stickyClearance} - ${stickyOffset})`,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      paddingInline: vars.space['1'],
      marginInline: `calc(-1 * ${vars.space['1']})`,
      paddingBlockEnd: vars.space['1'],
      '@media': {
        [md]: {
          maxBlockSize: 'none',
          overflowY: 'visible',
          paddingInline: 0,
          marginInline: 0,
          paddingBlockEnd: 0,
        },
      },
    },
  },
});
