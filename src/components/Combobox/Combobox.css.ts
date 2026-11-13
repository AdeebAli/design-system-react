import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { fg } = vars.color;

/** The input group: Input's wrapper, with room for the buttons at the end. */
export const group = style(
  layered({
    gap: vars.space['1'],
    paddingInlineEnd: vars.space['1'],
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
