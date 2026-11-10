import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The raised surface every overlay popup shares. */
export const popupSurface = style(
  layered({
    boxSizing: 'border-box',
    background: vars.color.bg.raised,
    color: vars.color.fg.default,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars.color.border.surface,
    boxShadow: vars.shadow.raised,
    borderRadius: vars.radius.lg,
  }),
);

// A small shift toward the trigger, so the popup appears to grow out of it.
const toward = (x: string, y: string) => ({
  opacity: 0,
  transform: `translate(${x}, ${y})`,
});
const shift = vars.space['1'];
const back = `calc(-1 * ${shift})`;

/** Enter and exit: opacity plus a small translate, on Base UI's attributes. */
export const popupMotion = style(
  layered({
    transitionProperty: 'opacity, transform',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.enter,
    selectors: {
      '&[data-ending-style]': {
        transitionTimingFunction: vars.motion.easing.exit,
      },
      '&[data-starting-style][data-side="bottom"], &[data-ending-style][data-side="bottom"]':
        toward('0', back),
      '&[data-starting-style][data-side="top"], &[data-ending-style][data-side="top"]':
        toward('0', shift),
      '&[data-starting-style][data-side="left"], &[data-ending-style][data-side="left"]':
        toward(shift, '0'),
      '&[data-starting-style][data-side="right"], &[data-ending-style][data-side="right"]':
        toward(back, '0'),
      '&[data-starting-style][data-side="inline-start"], &[data-ending-style][data-side="inline-start"]':
        toward(shift, '0'),
      '&[data-starting-style][data-side="inline-end"], &[data-ending-style][data-side="inline-end"]':
        toward(back, '0'),
      '&:dir(rtl)[data-starting-style][data-side="inline-start"], &:dir(rtl)[data-ending-style][data-side="inline-start"]':
        toward(back, '0'),
      '&:dir(rtl)[data-starting-style][data-side="inline-end"], &:dir(rtl)[data-ending-style][data-side="inline-end"]':
        toward(shift, '0'),
    },
  }),
);

/** The positioner wrapper: stacking and a viewport-bound width. */
export const positioner = style(
  layered({
    zIndex: vars.zIndex.popover,
    maxWidth: `calc(100vw - 2 * ${vars.space['4']})`,
  }),
);
