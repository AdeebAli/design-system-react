import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The inverse popup surface. Motion and the border width come from the shared overlay classes. */
export const popup = style(
  layered({
    boxSizing: 'border-box',
    background: vars.color.bg.inverse,
    color: vars.color.fg.inverse,
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    borderRadius: vars.radius.sm,
    paddingBlock: vars.space['1'],
    paddingInline: vars.space['2'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars.color.border.surface,
    maxInlineSize: '20rem',
    overflowWrap: 'break-word',
  }),
);

/** Stacks above toasts. */
export const positioner = style(
  layered({
    zIndex: vars.zIndex.tooltip,
    maxWidth: `calc(100vw - 2 * ${vars.space['4']})`,
  }),
);
