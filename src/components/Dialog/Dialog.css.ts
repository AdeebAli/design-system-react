import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const edge = vars.space['4'];

/** The dimmed page behind the popup. */
export const backdrop = style(
  layered({
    position: 'fixed',
    inset: 0,
    background: vars.color.overlay,
    zIndex: vars.zIndex.overlay,
    transitionProperty: 'opacity',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.enter,
    selectors: {
      '&[data-starting-style], &[data-ending-style]': { opacity: 0 },
      '&[data-ending-style]': {
        transitionTimingFunction: vars.motion.easing.exit,
      },
    },
  }),
);

/**
 * Centered with auto margins rather than a transform, so the motion's
 * `transform` is free. Fills the width less `space.4` each side on small screens.
 */
export const popup = style(
  layered({
    boxSizing: 'border-box',
    position: 'fixed',
    inset: 0,
    margin: 'auto',
    blockSize: 'fit-content',
    maxBlockSize: `calc(100dvh - 2 * ${edge})`,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
    padding: vars.space['6'],
    zIndex: vars.zIndex.modal,
    background: vars.color.bg.raised,
    color: vars.color.fg.default,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars.color.border.surface,
    boxShadow: vars.shadow.dialog,
    borderRadius: vars.radius.card,
    selectors: {
      '&[data-starting-style], &[data-ending-style]': {
        opacity: 0,
        transform: `translateY(${vars.space['1']})`,
      },
    },
  }),
);

export const sizes = styleVariants(
  {
    sm: { inlineSize: `min(${vars.size.dialog.sm}, 100% - 2 * ${edge})` },
    md: { inlineSize: `min(${vars.size.dialog.md}, 100% - 2 * ${edge})` },
    lg: { inlineSize: `min(${vars.size.dialog.lg}, 100% - 2 * ${edge})` },
  },
  (rule) => layered(rule),
);

/** Last in the DOM, so it doesn't take initial focus; placed at the corner here. */
export const close = style(
  layered({
    position: 'absolute',
    insetBlockStart: vars.space['3'],
    insetInlineEnd: vars.space['3'],
  }),
);
