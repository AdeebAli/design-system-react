import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const hiddenRule = {
  position: 'absolute',
  width: vars.space.px,
  height: vars.space.px,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

export const hidden = style(layered(hiddenRule));

export const focusable = style(
  layered({
    selectors: {
      '&:not(:focus)': hiddenRule,
      // Out of the flow, so a skip link doesn't push the page down when focused.
      '&:focus': {
        position: 'absolute',
        zIndex: vars.zIndex.tooltip,
        paddingBlock: vars.space['2'],
        paddingInline: vars.space['3'],
        background: vars.color.bg.surface,
        color: vars.color.fg.default,
        borderRadius: vars.radius.md,
        boxShadow: vars.shadow.md,
      },
    },
  }),
);
