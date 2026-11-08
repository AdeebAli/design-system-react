import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    minWidth: 0,
  }),
);

export const label = style(
  layered({
    fontSize: vars.font.size.sm,
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.default,
    alignSelf: 'flex-start',
    selectors: { '&[data-disabled]': { color: vars.color.fg.disabled } },
  }),
);

export const indicator = style(
  layered({
    marginInlineStart: vars.space['0.5'],
    color: vars.color.fg.danger,
  }),
);

const small = {
  fontSize: vars.font.size.xs,
  lineHeight: vars.font.lineHeight.normal,
  margin: 0,
} as const;

export const hint = style(layered({ ...small, color: vars.color.fg.muted }));

export const error = style(layered({ ...small, color: vars.color.fg.danger }));
