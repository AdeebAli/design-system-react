import {
  createVar,
  globalStyle,
  style,
  styleVariants,
} from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { componentsLayer } from '../../styles/layers.css';
import { layered } from '../../utils/recipe';

const forced = '(forced-colors: active)';
const hover = '(hover: hover)';

const padBlock = createVar();
const padInline = createVar();
const border = `${vars.borderWidth.thin} solid ${vars.color.border.subtle}`;

/** The scroll container. It also contains sticky stacking (Spec 13). */
export const wrapper = style(
  layered({
    overflowX: 'auto',
    isolation: 'isolate',
    maxWidth: '100%',
  }),
);

export const table = style(
  layered({
    width: '100%',
    margin: 0,
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontFamily: vars.font.family.sans,
    fontFeatureSettings: vars.font.features.sans,
  }),
);

export const hoverable = style({});

export const caption = style(
  layered({
    padding: `${vars.space['2']} ${vars.space['2']}`,
    textAlign: 'start',
    fontSize: vars.font.size.sm,
    color: vars.color.fg.muted,
    captionSide: 'top',
  }),
);

/**
 * Every `th` and `td`. `DataTable` reuses it, so it reads the size from
 * the nearest `data-size` ancestor.
 */
export const cell = style(
  layered({
    vars: { [padBlock]: vars.space['2'], [padInline]: vars.space['2'] },
    position: 'relative',
    padding: `${padBlock} ${padInline}`,
    fontSize: vars.font.size.sm,
    fontWeight: vars.font.weight.regular,
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.default,
    fontVariantNumeric: 'tabular-nums',
    // Breaks a long URL without shrinking columns to a letter per line.
    overflowWrap: 'break-word',
    textAlign: 'start',
    selectors: {
      '[data-size="sm"] &': {
        vars: { [padBlock]: vars.space['1'], [padInline]: vars.space['2'] },
      },
      'tbody &': { borderBlockStart: border },
      'thead &': {
        borderBlockStart: 'none',
        borderBlockEnd: border,
        fontSize: vars.font.size.xs,
        fontWeight: vars.font.weight.medium,
        letterSpacing: vars.font.letterSpacing.wide,
        textTransform: 'uppercase',
        color: vars.color.fg.muted,
      },
      'tfoot &': {
        borderBlockStart: border,
        fontWeight: vars.font.weight.semibold,
      },
      'tbody th&': {
        fontWeight: vars.font.weight.medium,
        letterSpacing: vars.font.letterSpacing.normal,
        textTransform: 'none',
        color: vars.color.fg.default,
      },
    },
  }),
);

export const align = styleVariants({
  start: layered({ textAlign: 'start' }),
  center: layered({ textAlign: 'center' }),
  end: layered({ textAlign: 'end' }),
});

/** A header cell whose padding belongs to its button or link. */
export const sortCell = style(layered({ padding: 0 }));

const justify = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
} as const;

export const sortControl = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['1'],
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    padding: `${padBlock} ${padInline}`,
    border: 'none',
    background: 'none',
    font: 'inherit',
    letterSpacing: 'inherit',
    textTransform: 'inherit',
    textAlign: 'inherit',
    color: 'inherit',
    textDecorationLine: 'none',
    cursor: 'pointer',
    selectors: {
      // Inside the cell, so the ring isn't clipped by the scroll wrapper.
      // Doubled to beat the shared ring's offset.
      '&:focus-visible:focus-visible': {
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
    },
  }),
);

export const sortAlign = styleVariants(justify, (value) =>
  layered({ justifyContent: value }),
);

export const sortIcon = style(
  layered({
    flexShrink: 0,
    selectors: {
      '[data-direction="none"] &': { opacity: 0.5 },
    },
  }),
);

export const row = style({});

/** The selected look, for `TableRow` and `DataTable`. */
export const rowSelected = style(
  layered({ background: vars.color.bg.accentSubtle }),
);

/** The sticky look, filled in by the sticky props. */
export const stickyCell = style({});

const marker = {
  content: '""',
  position: 'absolute',
  insetBlock: 0,
  insetInlineStart: 0,
  inlineSize: vars.borderWidth.thick,
  background: vars.color.bg.accent,
  '@media': { [forced]: { background: 'Highlight' } },
} as const;

globalStyle(`${rowSelected} > :first-child::before`, {
  '@layer': { [componentsLayer]: marker },
});

globalStyle(
  `${hoverable} tbody > tr:not([data-selected], [data-no-hover]):hover`,
  {
    '@layer': {
      [componentsLayer]: {
        '@media': { [hover]: { background: vars.color.bg.muted } },
      },
    },
  },
);
