import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg } = vars.color;
const enabled = '&:not([data-disabled])';

export const chip = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['1'],
    flexShrink: 0,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: vars.radius.full,
    background: bg.muted,
    color: fg.default,
    fontFamily: 'inherit',
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.tight,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    transitionProperty: 'background-color, color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&:focus-visible': {
        outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
        outlineOffset: vars.space['0.5'],
      },
      '&[data-pressed]': { background: bg.accent, color: fg.onAccent },
      '&[data-disabled]': {
        background: bg.disabled,
        color: fg.disabled,
        cursor: 'not-allowed',
      },
    },
    '@media': {
      '(hover: hover)': {
        selectors: {
          [`${enabled}:hover`]: { background: bg.mutedHover },
          [`${enabled}[data-pressed]:hover`]: { background: bg.accentHover },
        },
      },
    },
  }),
);

export const size = styleVariants({
  sm: layered({
    height: vars.size.chip.sm,
    paddingInline: vars.space['2'],
    fontSize: vars.font.size.sm,
  }),
  md: layered({
    height: vars.size.chip.md,
    paddingInline: vars.space['3'],
    fontSize: vars.font.size.md,
  }),
});

export const icon = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    width: '1em',
    height: '1em',
  }),
);
