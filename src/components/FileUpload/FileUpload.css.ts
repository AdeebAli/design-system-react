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

export const list = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
    minWidth: 0,
  }),
);

export const item = style(
  layered({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    columnGap: vars.space['2'],
    rowGap: vars.space['1'],
    minWidth: 0,
    paddingBlock: vars.space['1'],
    paddingInlineStart: vars.space['2'],
    borderRadius: vars.radius.md,
    background: bg.muted,
    color: fg.default,
    fontSize: vars.font.size.sm,
  }),
);

export const fileIcon = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.md,
    height: vars.size.icon.md,
    color: fg.muted,
  }),
);

export const details = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    minWidth: 0,
  }),
);

export const nameRow = style(
  layered({
    display: 'flex',
    alignItems: 'baseline',
    gap: vars.space['2'],
    minWidth: 0,
  }),
);

export const name = style(
  layered({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
);

export const size = style(
  layered({ flexShrink: 0, color: fg.muted, whiteSpace: 'nowrap' }),
);

export const status = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['1'],
    color: fg.muted,
  }),
);

export const doneIcon = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    width: vars.size.icon.sm,
    height: vars.size.icon.sm,
    color: fg.success,
  }),
);

export const errorIcon = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    width: vars.size.icon.sm,
    height: vars.size.icon.sm,
    color: fg.danger,
  }),
);

export const errorText = style(layered({ color: fg.danger }));
