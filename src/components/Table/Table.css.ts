import {
  createVar,
  fallbackVar,
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
/** A row's opaque hover or selected color, which sticky cells paint over their own. */
const rowBg = createVar();
/** The background of sticky cells, set from `stickyBackground`. */
const stickyBg = createVar();
const border = `${vars.borderWidth.thin} solid ${vars.color.border.subtle}`;

/** The scroll container. It also contains sticky stacking (Spec 13). */
export const wrapper = style(
  layered({
    overflowX: 'auto',
    isolation: 'isolate',
    maxWidth: '100%',
  }),
);

// The reserved sizes come from tokens: the header is two paddings, one line of
// `xs` text, and its rule, plus a gap for the focus ring. A sticky first column
// has a fixed width, `columnReserve`, and its text wraps inside it, so the
// reserve always covers it and a focused cell lands clear of it (WCAG 2.4.11).
// Browsers ignore `max-width` on table cells, so `width` and `min-width` set it.
// `overflow-wrap: anywhere` keeps a long word's min-content width from pushing
// the column wider, which `break-word` doesn't (it only breaks after layout).
const headerReserve = (pad: string) =>
  `calc(${pad} * 2 + ${vars.font.size.xs} * ${vars.font.lineHeight.normal} + ${vars.borderWidth.thin} + ${vars.space['1']})`;
const columnReserve = `calc(${vars.size.dialog.sm} / 2)`;

/** `scroll-padding` that keeps focus clear of a sticky header, by `size`. */
export const stickyHeaderPad = styleVariants({
  md: layered({ scrollPaddingBlockStart: headerReserve(vars.space['2']) }),
  sm: layered({ scrollPaddingBlockStart: headerReserve(vars.space['1']) }),
});

/** `scroll-padding` that keeps focus clear of a sticky first column. */
export const stickyColumnPad = style(
  layered({
    scrollPaddingInlineStart: `calc(${columnReserve} + ${vars.space['1']})`,
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

export const stickyBackground = styleVariants({
  canvas: layered({ vars: { [stickyBg]: vars.color.bg.canvas } }),
  surface: layered({ vars: { [stickyBg]: vars.color.bg.surface } }),
  raised: layered({ vars: { [stickyBg]: vars.color.bg.raised } }),
  sunken: layered({ vars: { [stickyBg]: vars.color.bg.sunken } }),
});

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
  layered({
    background: vars.color.bg.accentSubtle,
    vars: { [rowBg]: vars.color.bg.accentSubtle },
  }),
);

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
        '@media': {
          [hover]: {
            background: vars.color.bg.muted,
            vars: { [rowBg]: vars.color.bg.muted },
          },
        },
      },
    },
  },
);

// Sticky parts. `Table` sets the data attributes, so the cells need no props
// and stay server components. Sticky z-indexes stack inside the wrapper's
// isolation, so page overlays still sit above them.
const sticky = vars.zIndex.sticky;
const notSpanning = ':not([colspan]:not([colspan="1"]))';
const headerCells = `${table}[data-sticky-header] > thead > tr > *`;
// A first-column cell with `rowSpan` covers the rows below it, whose first
// child is really in the second column, so those rows don't stick. CSS can't
// count, so this lists spans of up to `maxRowSpan` rows, plus `rowSpan={0}`
// (to the end of the group). Longer spans aren't covered.
const maxRowSpan = 10;
const coveredRows = [`tr:has(> :first-child[rowspan="0"]) ~ tr`];
for (let span = 2; span <= maxRowSpan; span++) {
  for (let below = 1; below < span; below++) {
    coveredRows.push(
      `tr:has(> :first-child[rowspan="${span}"])${' + tr'.repeat(below)}`,
    );
  }
}
const firstColumnRow = `tr:not(${coveredRows.join(', ')})`;
const firstCells = `${table}[data-sticky-column] > :is(thead, tbody, tfoot) > ${firstColumnRow} > :first-child${notSpanning}`;

globalStyle(headerCells, {
  '@layer': {
    [componentsLayer]: {
      position: 'sticky',
      insetBlockStart: 0,
      zIndex: sticky,
      background: stickyBg,
    },
  },
});

globalStyle(firstCells, {
  '@layer': {
    [componentsLayer]: {
      position: 'sticky',
      insetInlineStart: 0,
      zIndex: sticky,
      boxSizing: 'border-box',
      inlineSize: columnReserve,
      minInlineSize: columnReserve,
      overflowWrap: 'anywhere',
      borderInlineEnd: border,
      // A hovered or selected row's opaque color replaces the sticky one.
      background: fallbackVar(rowBg, stickyBg),
    },
  },
});

// The corner sits above both the header row and the first column.
globalStyle(
  `${table}[data-sticky-header][data-sticky-column] > thead > ${firstColumnRow} > :first-child${notSpanning}`,
  {
    '@layer': {
      [componentsLayer]: { zIndex: `calc(${sticky} + 1)` },
    },
  },
);
