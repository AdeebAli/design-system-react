import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg, border } = vars.color;

const enabled = '&:not(:disabled):not([data-disabled])';

function colors(
  rest: { background: string; color: string; borderColor?: string },
  hover: string,
) {
  return layered({
    background: rest.background,
    color: rest.color,
    borderColor: rest.borderColor ?? 'transparent',
    selectors: { [`${enabled}:active`]: { background: hover } },
    '@media': {
      '(hover: hover)': {
        selectors: { [`${enabled}:hover`]: { background: hover } },
      },
    },
  });
}

export const button = recipe({
  base: layered({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: vars.radius.control,
    fontFamily: 'inherit',
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.tight,
    textDecorationLine: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&:disabled, &[data-disabled]': {
        background: bg.disabled,
        color: fg.disabled,
        borderColor: 'transparent',
        cursor: 'not-allowed',
      },
      '&[data-loading]': { cursor: 'progress' },
    },
  }),
  variants: {
    variant: { solid: {}, soft: {}, outline: {}, ghost: {} },
    tone: { accent: {}, neutral: {}, danger: {} },
    size: {
      sm: layered({
        height: vars.size.control.sm,
        paddingInline: vars.space['2'],
        gap: vars.space['1'],
        fontSize: vars.font.size.sm,
      }),
      md: layered({
        height: vars.size.control.md,
        paddingInline: vars.space['3'],
        gap: vars.space['1.5'],
        fontSize: vars.font.size.md,
      }),
      lg: layered({
        height: vars.size.control.lg,
        paddingInline: vars.space['4'],
        gap: vars.space['2'],
        fontSize: vars.font.size.lg,
      }),
    },
    square: {
      true: layered({ paddingInline: 0, aspectRatio: '1' }),
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { variant: 'solid', tone: 'accent' },
      style: colors(
        { background: bg.accent, color: fg.onAccent },
        bg.accentHover,
      ),
    },
    {
      variants: { variant: 'solid', tone: 'danger' },
      style: colors(
        { background: bg.danger, color: fg.onStatus },
        bg.dangerHover,
      ),
    },
    {
      variants: { variant: 'soft', tone: 'neutral' },
      style: colors({ background: bg.muted, color: fg.default }, bg.mutedHover),
    },
    {
      variants: { variant: 'outline', tone: 'neutral' },
      style: colors(
        {
          background: 'transparent',
          color: fg.default,
          borderColor: border.control,
        },
        bg.muted,
      ),
    },
    {
      variants: { variant: 'ghost', tone: 'neutral' },
      style: colors({ background: 'transparent', color: fg.default }, bg.muted),
    },
    {
      variants: { variant: 'ghost', tone: 'danger' },
      style: colors(
        { background: 'transparent', color: fg.danger },
        bg.dangerSubtle,
      ),
    },
    // A disabled outline keeps a visible edge.
    {
      variants: { variant: 'outline' },
      style: layered({
        selectors: {
          '&:disabled, &[data-disabled]': { borderColor: border.disabled },
        },
      }),
    },
    // Ghost buttons have no surface, so a disabled one stays transparent.
    {
      variants: { variant: 'ghost' },
      style: layered({
        selectors: {
          '&:disabled, &[data-disabled]': { background: 'transparent' },
        },
      }),
    },
  ],
  defaultVariants: {
    variant: 'solid',
    tone: 'accent',
    size: 'md',
    square: false,
  },
});

/** Wraps an icon element so it doesn't shrink. */
export const iconSlot = style(
  layered({ display: 'inline-flex', flexShrink: 0 }),
);

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export const spinner = style(
  layered({
    width: vars.size.icon.md,
    height: vars.size.icon.md,
    flexShrink: 0,
    animationName: spin,
    // 0ms under reduced motion (Spec 02), which leaves it still and visible.
    animationDuration: `calc(${vars.motion.duration.slow} * 2.5)`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  }),
);
