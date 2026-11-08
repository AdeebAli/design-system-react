import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const root = style(
  layered({ display: 'flex', flexDirection: 'column', gap: vars.space['1'] }),
);

export const label = style(
  layered({
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.normal,
    letterSpacing: vars.font.letterSpacing.wide,
    textTransform: 'uppercase',
    color: vars.color.fg.muted,
  }),
);

const valueBase = {
  fontWeight: vars.font.weight.semibold,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: vars.font.lineHeight.tight,
  color: vars.color.fg.default,
} as const;

export const value = styleVariants({
  sm: layered({
    ...valueBase,
    fontSize: vars.font.size['2xl'],
    letterSpacing: vars.font.letterSpacing.tight,
  }),
  md: layered({
    ...valueBase,
    fontSize: vars.font.size['3xl'],
    letterSpacing: vars.font.letterSpacing.tighter,
  }),
  lg: layered({
    ...valueBase,
    fontSize: vars.font.size['4xl'],
    letterSpacing: vars.font.letterSpacing.tighter,
  }),
});

export const change = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['0.5'],
    fontSize: vars.font.size.sm,
    fontWeight: vars.font.weight.semibold,
    fontVariantNumeric: 'tabular-nums',
  }),
);

export const sentiment = styleVariants({
  positive: layered({ color: vars.color.fg.success }),
  negative: layered({ color: vars.color.fg.danger }),
  neutral: layered({ color: vars.color.fg.muted }),
});

export const hint = style(
  layered({ fontSize: vars.font.size.sm, color: vars.color.fg.muted }),
);
