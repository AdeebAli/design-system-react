import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg, border } = vars.color;

/** The outer wrapper of a choice control with its own label (Checkbox, Radio, Switch). */
export const item = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['0.5'],
    minWidth: 0,
  }),
);

export const label = style(
  layered({
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: vars.space['2'],
    alignSelf: 'flex-start',
    fontSize: vars.font.size.md,
    lineHeight: vars.font.lineHeight.normal,
    color: fg.default,
    cursor: 'pointer',
    // The whole label is the target, so the small box still meets the 24 CSS pixel minimum (Spec 09).
    minHeight: '1.5rem',
    selectors: {
      '&[data-disabled]': { color: fg.disabled, cursor: 'not-allowed' },
    },
  }),
);

/** The control's row when it has a hint but no label. */
export const unlabeled = style(layered({ cursor: 'default' }));

/** Keeps the control centered on the label's first line. */
export const slot = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    height: '1lh',
    flexShrink: 0,
  }),
);

export const hint = styleVariants({
  checkbox: layered({
    margin: 0,
    fontSize: vars.font.size.xs,
    color: fg.muted,
    paddingInlineStart: `calc(1.125rem + ${vars.space['2']})`,
  }),
  switch: layered({
    margin: 0,
    fontSize: vars.font.size.xs,
    color: fg.muted,
    paddingInlineStart: `calc(2.25rem + ${vars.space['2']})`,
  }),
});

const ring = {
  outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
  outlineOffset: vars.space['0.5'],
} as const;

const boxBase = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '1.125rem',
  height: '1.125rem',
  background: bg.sunken,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: border.control,
  color: fg.onAccent,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color',
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
} as const;

const boxStates = {
  '&:focus-visible': ring,
  '&[data-checked], &[data-indeterminate]': {
    background: bg.accent,
    borderColor: bg.accent,
  },
  '&[data-invalid]': { borderColor: border.danger },
  '&[data-disabled]': {
    background: bg.disabled,
    borderColor: border.disabled,
    color: fg.disabled,
    cursor: 'not-allowed',
  },
  // With no label, a larger invisible hit area meets the 24 CSS pixel minimum (Spec 09).
  '&::before': {
    content: '""',
    position: 'absolute',
    // Inside the 1px border, so 1px more each way.
    inset: 'calc((1.125rem - 1.5rem) / 2 - 1px)',
  },
} as const;

export const checkbox = style(
  layered({ ...boxBase, borderRadius: vars.radius.sm, selectors: boxStates }),
);

export const radio = style(
  layered({ ...boxBase, borderRadius: vars.radius.full, selectors: boxStates }),
);

export const indicator = style(
  layered({ display: 'inline-flex', width: '0.875rem', height: '0.875rem' }),
);
globalStyle(`${indicator} > svg`, layered({ width: '100%', height: '100%' }));

// Forced colors replace backgrounds, which would hide the radio dot and the
// switch knob, so they draw in the text color instead.
const forcedMark = {
  '(forced-colors: active)': {
    forcedColorAdjust: 'none',
    background: 'CanvasText',
  },
} as const;

export const dot = style(
  layered({
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: vars.radius.full,
    background: 'currentColor',
    '@media': forcedMark,
  }),
);

export const track = style(
  layered({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    width: '2.25rem',
    height: '1.25rem',
    padding: '0.125rem',
    borderRadius: vars.radius.full,
    background: bg.sunken,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: border.control,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&:focus-visible': ring,
      '&[data-checked]': { background: bg.accent, borderColor: bg.accent },
      '&[data-invalid]': { borderColor: border.danger },
      '&[data-disabled]': {
        background: bg.disabled,
        borderColor: border.disabled,
        cursor: 'not-allowed',
      },
      '&::before': { content: '""', position: 'absolute', inset: '-0.25rem' },
    },
  }),
);

export const thumb = style(
  layered({
    width: '0.875rem',
    height: '0.875rem',
    borderRadius: vars.radius.full,
    background: border.control,
    '@media': forcedMark,
    transitionProperty: 'transform, background-color',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-checked]': {
        transform: 'translateX(1rem)',
        background: fg.onAccent,
      },
      '&[data-disabled]': { background: fg.disabled },
    },
  }),
);

// After the thumb's own state rules, so these win at the same specificity.
globalStyle(
  `${thumb}[data-checked], ${dot}`,
  layered({
    '@media': { '(forced-colors: active)': { background: 'CanvasText' } },
  }),
);
globalStyle(
  `${thumb}[data-disabled], [data-disabled] > ${dot}`,
  layered({
    '@media': { '(forced-colors: active)': { background: 'GrayText' } },
  }),
);
