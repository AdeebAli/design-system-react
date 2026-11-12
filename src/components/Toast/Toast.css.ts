import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const edge = vars.space['4'];

const viewportBase = style(
  layered({
    position: 'fixed',
    zIndex: vars.zIndex.toast,
    boxSizing: 'border-box',
    inlineSize: `min(24rem, calc(100vw - 2 * ${edge}))`,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['2'],
  }),
);

/** The list's corner or edge. */
export const viewport = styleVariants({
  'bottom-end': [
    viewportBase,
    layered({ insetBlockEnd: edge, insetInlineEnd: edge }),
  ],
  'bottom-start': [
    viewportBase,
    layered({ insetBlockEnd: edge, insetInlineStart: edge }),
  ],
  bottom: [
    viewportBase,
    layered({ insetBlockEnd: edge, insetInline: 0, marginInline: 'auto' }),
  ],
  'top-end': [
    viewportBase,
    layered({ insetBlockStart: edge, insetInlineEnd: edge }),
  ],
  'top-start': [
    viewportBase,
    layered({ insetBlockStart: edge, insetInlineStart: edge }),
  ],
  top: [
    viewportBase,
    layered({ insetBlockStart: edge, insetInline: 0, marginInline: 'auto' }),
  ],
});

/** One toast: its layout and motion, moved by Base UI's swipe variables. */
export const root = style(
  layered({
    display: 'block',
    padding: vars.space['3'],
    transitionProperty: 'opacity, transform',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.enter,
    transform:
      'translate(var(--toast-swipe-movement-x, 0), var(--toast-swipe-movement-y, 0))',
    selectors: {
      '&[data-starting-style]': {
        opacity: 0,
        transform: `translateY(${vars.space['2']})`,
      },
      '&[data-ending-style]': {
        opacity: 0,
        transitionTimingFunction: vars.motion.easing.exit,
      },
      '&[data-swiping]': { transitionDuration: '0s' },
    },
  }),
);

/** Icon, text, and buttons in a row. */
export const content = style(
  layered({
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.space['3'],
  }),
);

export const icon = style(
  layered({ flexShrink: 0, marginBlockStart: vars.space['0.5'] }),
);

export const text = style(
  layered({
    flex: '1 1 auto',
    minInlineSize: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
  }),
);

export const title = style(
  layered({
    margin: 0,
    fontSize: vars.font.size.sm,
    fontWeight: vars.font.weight.medium,
    color: vars.color.fg.default,
  }),
);

export const description = style(
  layered({
    margin: 0,
    fontSize: vars.font.size.sm,
    color: vars.color.fg.muted,
  }),
);

export const actions = style(
  layered({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['1'],
  }),
);
