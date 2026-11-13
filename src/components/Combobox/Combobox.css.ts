import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { fg } = vars.color;

const ring = {
  outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
  outlineOffset: vars.space['0.5'],
} as const;

/**
 * The input group: like Input's wrapper, with room for the buttons at the
 * end. A complete style, not an override of Input's wrapper, since two classes
 * in one layer resolve by stylesheet order, which differs between builds.
 */
export const group = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['1'],
    paddingInlineStart: vars.space['3'],
    paddingInlineEnd: vars.space['1'],
    minWidth: 0,
    cursor: 'text',
    selectors: { '&:focus-within:has(:focus-visible)': ring },
  }),
);

/** The clear and chevron buttons inside the input group. */
export const button = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: vars.size.control.sm,
    height: vars.size.control.sm,
    maxHeight: '100%',
    padding: 0,
    border: 'none',
    borderRadius: vars.radius.md,
    background: 'transparent',
    color: fg.muted,
    cursor: 'pointer',
    selectors: {
      '&:focus-visible': {
        outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
      '&:disabled': { cursor: 'not-allowed', color: fg.disabled },
    },
    '@media': {
      '(hover: hover)': {
        selectors: { '&:hover:not(:disabled)': { color: fg.default } },
      },
    },
  }),
);

export const icon = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.md,
    height: vars.size.icon.md,
  }),
);

/** Visible text for the loading and empty states. */
export const status = style(
  layered({
    display: 'block',
    paddingBlock: vars.space['1.5'],
    paddingInline: vars.space['2'],
    color: fg.muted,
    fontSize: vars.font.size.sm,
  }),
);
