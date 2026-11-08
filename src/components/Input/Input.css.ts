import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg, border } = vars.color;

/** Shared by Input's wrapper, Textarea, and Select's trigger. */
export const control = style(
  layered({
    background: bg.sunken,
    color: fg.default,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: border.control,
    borderRadius: vars.radius.control,
    fontFamily: 'inherit',
    fontSize: vars.font.size.md,
    lineHeight: vars.font.lineHeight.normal,
    transitionProperty: 'border-color, background-color, color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-invalid]': { borderColor: border.danger },
      '&[data-disabled]': {
        background: bg.disabled,
        color: fg.disabled,
        borderColor: border.disabled,
        cursor: 'not-allowed',
      },
    },
    // iOS Safari zooms into text smaller than font.size.lg (Spec 09).
    '@media': { '(pointer: coarse)': { fontSize: vars.font.size.lg } },
  }),
);

const ring = {
  outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
  outlineOffset: vars.space['0.5'],
} as const;

export const wrapper = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    paddingInline: vars.space['3'],
    minWidth: 0,
    cursor: 'text',
    selectors: { '&:focus-within:has(:focus-visible)': ring },
  }),
);

export const size = styleVariants({
  sm: layered({ height: vars.size.control.sm }),
  md: layered({ height: vars.size.control.md }),
  lg: layered({ height: vars.size.control.lg }),
});

export const input = style(
  layered({
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
    selectors: {
      '&::placeholder': { color: fg.muted, opacity: 1 },
      '&:disabled': { cursor: 'not-allowed' },
    },
  }),
);

export const icon = style(
  layered({ display: 'inline-flex', flexShrink: 0, color: fg.muted }),
);

export const textarea = style(
  layered({
    display: 'block',
    width: '100%',
    // Two rows of text, plus padding and border.
    minHeight: `calc(2lh + 2 * ${vars.space['2']} + 2 * 1px)`,
    paddingBlock: vars.space['2'],
    paddingInline: vars.space['3'],
    selectors: {
      '&:focus-visible': ring,
      '&::placeholder': { color: fg.muted, opacity: 1 },
    },
  }),
);

export const resize = styleVariants({
  vertical: layered({ resize: 'vertical' }),
  none: layered({ resize: 'none' }),
});
