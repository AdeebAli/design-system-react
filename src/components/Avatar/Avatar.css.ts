import { createVar, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const forced = '(forced-colors: active)';
const { bg, fg } = vars.color;

/** The status dot's diameter, and the gap cut around it. */
const dot = createVar();
const gap = vars.space['0.5'];

export const root = style(
  layered({
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    verticalAlign: 'middle',
    fontWeight: vars.font.weight.medium,
    lineHeight: 1,
    userSelect: 'none',
  }),
);

export const size = styleVariants({
  sm: layered({
    inlineSize: vars.size.avatar.sm,
    blockSize: vars.size.avatar.sm,
    fontSize: vars.font.size.xs,
    vars: { [dot]: vars.space['1.5'] },
  }),
  md: layered({
    inlineSize: vars.size.avatar.md,
    blockSize: vars.size.avatar.md,
    fontSize: vars.font.size.sm,
    vars: { [dot]: vars.space['2'] },
  }),
  lg: layered({
    inlineSize: vars.size.avatar.lg,
    blockSize: vars.size.avatar.lg,
    fontSize: vars.font.size.lg,
    vars: { [dot]: vars.space['3'] },
  }),
  xl: layered({
    inlineSize: vars.size.avatar.xl,
    blockSize: vars.size.avatar.xl,
    fontSize: vars.font.size['2xl'],
    vars: { [dot]: vars.space['4'] },
  }),
});

export const face = style(
  layered({
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    inlineSize: '100%',
    blockSize: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: vars.radius.full,
    background: bg.muted,
    color: fg.default,
    selectors: {
      [`${root}[data-shape='square'] &`]: { borderRadius: vars.radius.md },
      // Transparent, so it shows only in forced colors, where it keeps the
      // edge. It's drawn over the image, so the image still fills the face.
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        border: `${vars.borderWidth.thin} solid transparent`,
        borderRadius: 'inherit',
        pointerEvents: 'none',
      },
    },
  }),
);

// A mask reads only alpha, so the opaque stop's color is never seen.
const cut = (x: string) =>
  `radial-gradient(circle at ${x} calc(100% - ${dot} / 2), transparent calc(${dot} / 2 + ${gap}), black calc(${dot} / 2 + ${gap} + ${vars.borderWidth.thin}))`;

/** Cuts a gap around the status dot, so it needs no background color. */
export const masked = style(
  layered({
    maskImage: cut(`calc(100% - ${dot} / 2)`),
    selectors: { '&:dir(rtl)': { maskImage: cut(`calc(${dot} / 2)`) } },
  }),
);

export const image = style(
  layered({
    position: 'absolute',
    inset: 0,
    inlineSize: '100%',
    blockSize: '100%',
    objectFit: 'cover',
    // Hidden, not removed, so a failed image never paints a broken icon.
    selectors: { '&[data-loading], &[data-error]': { visibility: 'hidden' } },
  }),
);

export const fallback = style(
  layered({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
  }),
);

export const color = styleVariants(
  { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' } as const,
  (n) => layered({ background: bg.avatar[n], color: fg.avatar[n] }),
);

const ring = {
  borderStyle: 'solid',
  borderWidth: `calc(${dot} / 4)`,
  background: 'transparent',
} as const;

export const dotBase = style(
  layered({
    position: 'absolute',
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    inlineSize: dot,
    blockSize: dot,
    boxSizing: 'border-box',
    borderRadius: vars.radius.full,
    '@media': { [forced]: { forcedColorAdjust: 'none' } },
  }),
);

export const status = styleVariants({
  online: layered({
    background: bg.success,
    '@media': { [forced]: { background: 'CanvasText' } },
  }),
  // A ring with its lower half filled, so it isn't the offline ring in another color.
  away: layered({
    ...ring,
    borderColor: bg.warning,
    background: `linear-gradient(to top, ${bg.warning} 50%, transparent 50%)`,
    '@media': {
      [forced]: {
        borderColor: 'CanvasText',
        background: 'linear-gradient(to top, CanvasText 50%, transparent 50%)',
      },
    },
  }),
  busy: layered({
    background: bg.danger,
    '@media': { [forced]: { background: 'CanvasText' } },
    selectors: {
      // The bar across makes busy a different shape from online.
      '&::after': {
        content: '""',
        position: 'absolute',
        insetInline: '20%',
        insetBlockStart: '50%',
        blockSize: `calc(${dot} / 4)`,
        transform: 'translateY(-50%)',
        borderRadius: vars.radius.full,
        background: fg.onStatus,
        '@media': { [forced]: { background: 'Canvas' } },
      },
    },
  }),
  offline: layered({
    ...ring,
    borderColor: fg.muted,
    '@media': { [forced]: { borderColor: 'CanvasText' } },
  }),
});
