import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The trigger's summary: the first label, truncated, and the count. */
export const summary = style(
  layered({
    display: 'flex',
    alignItems: 'baseline',
    gap: vars.space['1'],
    minWidth: 0,
  }),
);

export const first = style(
  layered({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
);

export const count = style(
  layered({
    flexShrink: 0,
    color: vars.color.fg.muted,
    whiteSpace: 'nowrap',
  }),
);

/** The searchable control: chips and the input, wrapping onto new lines. */
export const chips = style(
  layered({
    flexWrap: 'wrap',
    gap: vars.space['1'],
    paddingBlock: vars.space['0.5'],
    paddingInlineStart: vars.space['1'],
  }),
);

export const minHeight = styleVariants({
  sm: layered({ minHeight: vars.size.control.sm }),
  md: layered({ minHeight: vars.size.control.md }),
  lg: layered({ minHeight: vars.size.control.lg }),
});

export const chip = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['0.5'],
    minWidth: 0,
    maxWidth: '100%',
    paddingInlineStart: vars.space['2'],
    background: vars.color.bg.muted,
    color: vars.color.fg.default,
    borderRadius: vars.radius.sm,
    fontSize: vars.font.size.sm,
    lineHeight: vars.font.lineHeight.normal,
    outline: 'none',
    selectors: {
      '&[data-highlighted]': {
        outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
    },
    // Backgrounds are replaced in forced colors, so the chip keeps a border.
    '@media': {
      '(forced-colors: active)': { border: '1px solid CanvasText' },
    },
  }),
);

export const chipLabel = style(
  layered({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
);

/** A `space.6` target, the minimum WCAG 2.5.8 asks for. */
export const chipRemove = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: vars.space['6'],
    height: vars.space['6'],
    padding: 0,
    border: 'none',
    borderRadius: vars.radius.sm,
    background: 'transparent',
    color: vars.color.fg.muted,
    cursor: 'pointer',
    selectors: {
      '&:focus-visible': {
        outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
      '&:disabled': { cursor: 'not-allowed' },
    },
    '@media': {
      '(hover: hover)': {
        selectors: {
          '&:hover:not(:disabled)': { color: vars.color.fg.default },
        },
      },
    },
  }),
);

export const chipRemoveIcon = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.sm,
    height: vars.size.icon.sm,
  }),
);

export const chipsInput = style(
  layered({
    minWidth: '4rem',
    height: vars.space['6'],
  }),
);
