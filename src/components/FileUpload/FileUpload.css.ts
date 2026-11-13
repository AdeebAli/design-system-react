import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg, border } = vars.color;

const ring = {
  outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
  outlineOffset: vars.space['0.5'],
} as const;

export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['2'],
    minWidth: 0,
  }),
);

/** The area the hidden input covers: the drop target or the button. */
export const target = style(
  layered({
    position: 'relative',
    selectors: { '&:focus-within:has(:focus-visible)': ring },
  }),
);

export const dropzone = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['2'],
    padding: vars.space['6'],
    background: bg.sunken,
    color: fg.muted,
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: border.control,
    borderRadius: vars.radius.control,
    textAlign: 'center',
    transitionProperty: 'border-color, background-color, color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      [`${root}[data-dragging] &`]: {
        background: bg.accentSubtle,
        borderStyle: 'solid',
        borderColor: bg.accent,
      },
      [`${root}[data-invalid] &`]: { borderColor: border.danger },
      [`${root}[data-disabled] &`]: {
        background: bg.disabled,
        color: fg.disabled,
        borderColor: border.disabled,
      },
    },
    '@media': {
      '(forced-colors: active)': {
        selectors: {
          [`${root}[data-dragging] &`]: { borderColor: 'Highlight' },
        },
      },
    },
  }),
);

export const button = style(
  layered({
    alignSelf: 'flex-start',
    selectors: {
      [`${root}[data-invalid] &`]: { borderColor: border.danger },
    },
  }),
);

export const icon = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.lg,
    height: vars.size.icon.lg,
  }),
);

export const buttonIcon = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.md,
    height: vars.size.icon.md,
  }),
);

/** The native input: invisible, covering the target, so a click or tap opens the picker. */
export const input = style(
  layered({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    selectors: { '&:disabled': { cursor: 'not-allowed' } },
  }),
);
