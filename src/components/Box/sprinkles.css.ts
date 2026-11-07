import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import { utilitiesLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { breakpoints } from '../../tokens/breakpoints';

const space = vars.space;
const container = {
  'container.sm': vars.size.container.sm,
  'container.md': vars.size.container.md,
  'container.lg': vars.size.container.lg,
  'container.xl': vars.size.container.xl,
};
const width = {
  ...space,
  ...container,
  auto: 'auto',
  full: '100%',
  fit: 'fit-content',
  min: 'min-content',
  max: 'max-content',
  '1/2': '50%',
  '1/3': '33.3333%',
  '2/3': '66.6667%',
  '1/4': '25%',
  '3/4': '75%',
};
const height = { ...width, screen: '100dvh' };
const selfAlign = {
  auto: 'auto',
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};
const inset = { ...space, auto: 'auto', full: '100%' };
const overflow = ['visible', 'hidden', 'auto', 'scroll'] as const;
const margin = { ...space, auto: 'auto' };

function range<T>(build: (n: number) => T) {
  const n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
  return n.map((value) => [value, build(value)] as const);
}

const gridSpan = {
  ...(Object.fromEntries(
    range((n) => `span ${n} / span ${n}`).map(([n, value]) => [
      `span-${n}`,
      value,
    ]),
  ) as Record<
    `span-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`,
    string
  >),
  full: '1 / -1',
};

const gridColumns = Object.fromEntries(
  range((n) => `repeat(${n}, minmax(0, 1fr))`).map(([n, value]) => [
    String(n),
    value,
  ]),
) as Record<`${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`, string>;

const responsive = defineProperties({
  '@layer': utilitiesLayer,
  conditions: {
    base: {},
    sm: { '@media': `screen and (min-width: ${breakpoints.sm})` },
    md: { '@media': `screen and (min-width: ${breakpoints.md})` },
    lg: { '@media': `screen and (min-width: ${breakpoints.lg})` },
    xl: { '@media': `screen and (min-width: ${breakpoints.xl})` },
  },
  defaultCondition: 'base',
  // Declared all sides, then axis, then single side, so the more specific prop
  // wins within a breakpoint (Spec 04).
  properties: {
    margin,
    marginInline: margin,
    marginBlock: margin,
    marginBlockStart: margin,
    marginBlockEnd: margin,
    marginInlineStart: margin,
    marginInlineEnd: margin,
    padding: space,
    paddingInline: space,
    paddingBlock: space,
    paddingBlockStart: space,
    paddingBlockEnd: space,
    paddingInlineStart: space,
    paddingInlineEnd: space,
    width,
    minWidth: width,
    height,
    minHeight: height,
    maxWidth: {
      ...container,
      none: 'none',
      full: '100%',
      fit: 'fit-content',
      prose: vars.size.prose,
    },
    maxHeight: {
      none: 'none',
      full: '100%',
      fit: 'fit-content',
      screen: '100dvh',
    },
    flexGrow: ['0', '1'],
    flexShrink: ['0', '1'],
    alignSelf: selfAlign,
    justifySelf: selfAlign,
    gridColumn: gridSpan,
    gridRow: gridSpan,
    gap: space,
    rowGap: space,
    columnGap: space,
    display: [
      'none',
      'block',
      'inline',
      'inline-block',
      'flex',
      'inline-flex',
      'grid',
      'inline-grid',
    ],
    flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
    flexWrap: ['nowrap', 'wrap'],
    alignItems: {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      baseline: 'baseline',
    },
    justifyContent: {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    },
    gridTemplateColumns: gridColumns,
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    insetBlockStart: inset,
    insetBlockEnd: inset,
    insetInlineStart: inset,
    insetInlineEnd: inset,
    overflow,
    overflowX: overflow,
    overflowY: overflow,
  },
  shorthands: {
    marginX: ['marginInline'],
    marginY: ['marginBlock'],
    marginTop: ['marginBlockStart'],
    marginBottom: ['marginBlockEnd'],
    marginStart: ['marginInlineStart'],
    marginEnd: ['marginInlineEnd'],
    paddingX: ['paddingInline'],
    paddingY: ['paddingBlock'],
    paddingTop: ['paddingBlockStart'],
    paddingBottom: ['paddingBlockEnd'],
    paddingStart: ['paddingInlineStart'],
    paddingEnd: ['paddingInlineEnd'],
    insetTop: ['insetBlockStart'],
    insetBottom: ['insetBlockEnd'],
    insetStart: ['insetInlineStart'],
    insetEnd: ['insetInlineEnd'],
  },
});

const visual = defineProperties({
  '@layer': utilitiesLayer,
  properties: {
    background: { transparent: 'transparent', ...vars.color.bg },
    color: { inherit: 'inherit', ...vars.color.fg },
    borderColor: vars.color.border,
    borderWidth: {
      none: { borderWidth: 0, borderStyle: 'none' },
      thin: { borderWidth: vars.borderWidth.thin, borderStyle: 'solid' },
      thick: { borderWidth: vars.borderWidth.thick, borderStyle: 'solid' },
    },
    borderRadius: vars.radius,
    boxShadow: vars.shadow,
    zIndex: vars.zIndex,
  },
});

export const sprinkles = createSprinkles(responsive, visual);
