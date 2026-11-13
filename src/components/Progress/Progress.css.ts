import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const forced = '(forced-colors: active)';

export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1.5'],
    minInlineSize: 0,
  }),
);

export const header = style(
  layered({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: vars.space['3'],
    fontSize: vars.font.size.sm,
    lineHeight: vars.font.lineHeight.normal,
  }),
);

export const label = style(
  layered({
    minInlineSize: 0,
    color: vars.color.fg.default,
    fontWeight: vars.font.weight.medium,
  }),
);

export const value = style(
  layered({
    marginInlineStart: 'auto',
    flexShrink: 0,
    color: vars.color.fg.muted,
    fontVariantNumeric: 'tabular-nums',
  }),
);

export const track = style(
  layered({
    position: 'relative',
    overflow: 'hidden',
    inlineSize: '100%',
    borderRadius: vars.radius.full,
    background: vars.color.bg.muted,
    '@media': {
      [forced]: { border: `${vars.borderWidth.thin} solid CanvasText` },
    },
  }),
);

export const size = styleVariants({
  sm: layered({ blockSize: vars.space['1'] }),
  md: layered({ blockSize: vars.space['2'] }),
});

const slide = keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(250%)' },
});
const slideRtl = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(-250%)' },
});

export const fill = style(
  layered({
    position: 'absolute',
    insetBlock: 0,
    borderRadius: 'inherit',
    transitionProperty: 'width',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      // Base UI sets the width and inline start for a known value. Unknown,
      // a segment slides across. With reduced motion the duration is 0ms
      // (Spec 02), which leaves it still at the start: a static partial fill.
      '&[data-indeterminate]': {
        insetInlineStart: 0,
        inlineSize: '40%',
        animationName: slide,
        animationDuration: `calc(${vars.motion.duration.slow} * 5)`,
        animationTimingFunction: vars.motion.easing.standard,
        animationIterationCount: 'infinite',
      },
      '&[data-indeterminate]:dir(rtl)': { animationName: slideRtl },
    },
    '@media': {
      [forced]: { forcedColorAdjust: 'none', background: 'Highlight' },
    },
  }),
);

export const tone = styleVariants({
  accent: layered({ background: vars.color.bg.accent }),
  success: layered({ background: vars.color.bg.success }),
  warning: layered({ background: vars.color.bg.warning }),
  danger: layered({ background: vars.color.bg.danger }),
});
