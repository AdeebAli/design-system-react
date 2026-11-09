import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const STATUS = ['success', 'warning', 'danger', 'info'] as const;

export const badge = recipe({
  base: layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['1'],
    borderRadius: vars.radius.full,
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.normal,
    whiteSpace: 'nowrap',
    // A long label truncates instead of overflowing its container, and
    // minWidth lets it shrink as a grid or flex item.
    maxWidth: '100%',
    minWidth: 0,
  }),
  variants: {
    tone: {
      neutral: {},
      accent: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
    },
    variant: { soft: {}, solid: {} },
    size: {
      sm: layered({
        paddingBlock: vars.space['0.5'],
        paddingInline: vars.space['1.5'],
      }),
      md: layered({
        paddingBlock: vars.space['1'],
        paddingInline: vars.space['2'],
      }),
    },
  },
  compoundVariants: [
    {
      variants: { tone: 'neutral', variant: 'soft' },
      style: layered({
        background: vars.color.bg.muted,
        color: vars.color.fg.default,
      }),
    },
    {
      variants: { tone: 'neutral', variant: 'solid' },
      style: layered({
        background: vars.color.bg.inverse,
        color: vars.color.fg.inverse,
      }),
    },
    {
      variants: { tone: 'accent', variant: 'soft' },
      style: layered({
        background: vars.color.bg.accentSubtle,
        color: vars.color.fg.accent,
      }),
    },
    {
      variants: { tone: 'accent', variant: 'solid' },
      style: layered({
        background: vars.color.bg.accent,
        color: vars.color.fg.onAccent,
      }),
    },
    ...STATUS.flatMap((tone) => [
      {
        variants: { tone, variant: 'soft' as const },
        style: layered({
          background: vars.color.bg[`${tone}Subtle`],
          color: vars.color.fg[tone],
        }),
      },
      {
        variants: { tone, variant: 'solid' as const },
        style: layered({
          background: vars.color.bg[tone],
          color: vars.color.fg.onStatus,
        }),
      },
    ]),
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft', size: 'md' },
});

/** Sizes an icon element to the badge's text. */
export const icon = style(layered({ display: 'inline-flex' }));

globalStyle(`${icon} > svg`, layered({ width: '1em', height: '1em' }));

/** The text, which ends in an ellipsis when the badge runs out of room. */
export const label = style(
  layered({ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }),
);
