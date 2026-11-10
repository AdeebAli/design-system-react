import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The padding, and a width that never exceeds the viewport. */
export const popup = style(
  layered({
    padding: vars.space['4'],
    maxInlineSize: `calc(100vw - 2 * ${vars.space['4']})`,
    outline: 'none',
  }),
);

const size = vars.space['2'];
// Room for the shadow around the visible half, which the clip would otherwise cut.
const room = `calc(-1 * ${vars.space['12']})`;
// Shows the half of the arrow outside the popup, plus 1px over the popup's own border.
const edge = 'calc(50% - 1px)';

/**
 * The arrow's box is `size` square and centered on the popup's edge, which
 * Base UI aligns with the trigger's center. A rotated square inside it draws
 * the point, and the box clips it to the outer half, so the popup's border
 * and shadow don't show through the join.
 */
export const arrow = style(
  layered({
    inlineSize: size,
    blockSize: size,
    pointerEvents: 'none',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      boxSizing: 'border-box',
      background: vars.color.bg.raised,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: vars.color.border.surface,
      boxShadow: vars.shadow.raised,
      transform: 'rotate(45deg)',
    },
    selectors: {
      // On the popup's bottom edge, pointing down.
      '&[data-side="top"]': {
        insetBlockEnd: `calc(${size} / -2)`,
        clipPath: `inset(${edge} ${room} ${room} ${room})`,
      },
      '&[data-side="bottom"]': {
        insetBlockStart: `calc(${size} / -2)`,
        clipPath: `inset(${room} ${room} ${edge} ${room})`,
      },
      // Physical sides, and the logical ones in each direction. The popup is
      // on `side` of the trigger, so the arrow is on the popup's opposite edge.
      '&[data-side="left"], &:dir(ltr)[data-side="inline-start"], &:dir(rtl)[data-side="inline-end"]':
        {
          insetInlineEnd: 'auto',
          right: `calc(${size} / -2)`,
          left: 'auto',
          clipPath: `inset(${room} ${room} ${room} ${edge})`,
        },
      '&[data-side="right"], &:dir(ltr)[data-side="inline-end"], &:dir(rtl)[data-side="inline-start"]':
        {
          right: 'auto',
          left: `calc(${size} / -2)`,
          clipPath: `inset(${room} ${edge} ${room} ${room})`,
        },
    },
    '@media': {
      '(forced-colors: active)': {
        selectors: {
          '&::before': { borderColor: 'CanvasText' },
        },
      },
    },
  }),
);
