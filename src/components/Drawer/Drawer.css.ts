import { createVar, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** How far the panel extends past the screen edge, so overshooting a swipe shows no gap. */
const bleed = vars.space['12'];
/** Clear space left beside a side panel, so there is always backdrop to tap. */
const gutter = vars.space['8'];
/**
 * The exit offset moves the panel its own width (bleed included) plus this, so
 * its border and the reach of `shadow.dialog` are off-screen once it's closed.
 */
const clear = vars.space['8'];
/** 1 in left-to-right text and -1 in right-to-left, to flip the slide offsets. */
const flow = createVar();

/** The dimmed page behind the panel. */
export const backdrop = style(
  layered({
    position: 'fixed',
    inset: 0,
    background: vars.color.overlay,
    zIndex: vars.zIndex.overlay,
    transitionProperty: 'opacity',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.enter,
    selectors: {
      '&[data-starting-style], &[data-ending-style]': { opacity: 0 },
      '&[data-ending-style]': {
        transitionTimingFunction: vars.motion.easing.exit,
      },
    },
  }),
);

/** Holds the panel, over the backdrop. Its bleed is clipped here. */
export const viewport = style(
  layered({
    position: 'fixed',
    inset: 0,
    // Clipped, not hidden: a hidden box still scrolls to reveal a focused element.
    overflow: 'clip',
    zIndex: vars.zIndex.modal,
  }),
);

/**
 * The title keeps clear of the close button, which sits `space.3` from the
 * corner, less the padding the content already has. The popup marks itself.
 */
export const title = style(
  layered({
    selectors: {
      '[data-close-shown] &': {
        paddingInlineEnd: `calc(${vars.space['3']} + ${vars.size.control.sm} + ${vars.space['2']} - ${vars.space['6']})`,
      },
    },
  }),
);

/**
 * The panel. `transform` follows a swipe through Base UI's variable, and
 * carries the enter and exit offsets, so nothing else positions with it.
 */
export const popup = style(
  layered({
    vars: { [flow]: '1' },
    boxSizing: 'border-box',
    position: 'absolute',
    insetBlockStart: 0,
    blockSize: '100dvh',
    background: vars.color.bg.raised,
    color: vars.color.fg.default,
    borderStyle: 'solid',
    borderWidth: 0,
    borderColor: vars.color.border.surface,
    boxShadow: vars.shadow.dialog,
    transform: 'translateX(var(--drawer-swipe-movement-x, 0))',
    transitionProperty: 'transform',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.enter,
    selectors: {
      '&:dir(rtl)': { vars: { [flow]: '-1' } },
      '&[data-ending-style]': {
        transitionTimingFunction: vars.motion.easing.exit,
      },
      '&[data-swiping]': { transitionDuration: '0s', userSelect: 'none' },
    },
  }),
);

/**
 * Placed with logical properties against the popup's own `dir`. The bleed
 * sits on the outer edge, as padding with a matching negative margin, and
 * the border and rounded corners on the inner edge.
 */
export const sides = styleVariants(
  {
    end: {
      insetInlineEnd: 0,
      marginInlineEnd: `calc(-1 * ${bleed})`,
      paddingInlineEnd: bleed,
      borderInlineStartWidth: '1px',
      borderStartStartRadius: vars.radius.card,
      borderEndStartRadius: vars.radius.card,
      selectors: {
        '&[data-starting-style], &[data-ending-style]': {
          transform: `translateX(calc(${flow} * (100% + ${clear})))`,
        },
      },
    },
    start: {
      insetInlineStart: 0,
      marginInlineStart: `calc(-1 * ${bleed})`,
      paddingInlineStart: bleed,
      borderInlineEndWidth: '1px',
      borderStartEndRadius: vars.radius.card,
      borderEndEndRadius: vars.radius.card,
      selectors: {
        '&[data-starting-style], &[data-ending-style]': {
          transform: `translateX(calc(${flow} * -1 * (100% + ${clear})))`,
        },
      },
    },
    // Placed by the bottom sheet's own styles.
    bottom: {},
  },
  (rule) => layered(rule),
);

/** The visible width, never more than the viewport less the gutter, plus the bleed. */
const width = (token: string) =>
  `calc(min(${token}, 100% - ${gutter}) + ${bleed})`;

export const sizes = styleVariants(
  {
    sm: { inlineSize: width(vars.size.drawer.sm) },
    md: { inlineSize: width(vars.size.drawer.md) },
    lg: { inlineSize: width(vars.size.drawer.lg) },
  },
  (rule) => layered(rule),
);

/** Stacks the children and scrolls tall ones, inside the bleed. */
export const content = style(
  layered({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
    blockSize: '100%',
    padding: vars.space['6'],
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  }),
);

/** Last in the DOM, so it doesn't take initial focus; placed at the corner here. */
export const close = style(
  layered({
    position: 'absolute',
    insetBlockStart: vars.space['3'],
    insetInlineEnd: vars.space['3'],
  }),
);
