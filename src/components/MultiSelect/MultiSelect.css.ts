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

const ring = {
  outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
  outlineOffset: vars.space['0.5'],
} as const;

/**
 * The searchable control: chips and the input, wrapping onto new lines. A
 * complete style, not an override of Input's wrapper, since two classes in one
 * layer resolve by stylesheet order, which differs between builds.
 */
export const chips = style(
  layered({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: vars.space['1'],
    // A row of space.6 chips fills the small control height exactly.
    paddingBlock: `calc((${vars.size.control.sm} - ${vars.space['6']}) / 2 - ${vars.borderWidth.thin})`,
    paddingInline: vars.space['1'],
    minWidth: 0,
    cursor: 'text',
    selectors: { '&:focus-within:has(:focus-visible)': ring },
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

/**
 * The search input among the chips: like Input's, padded so its text starts
 * where Input's does when there are no chips. A complete style, for the same
 * reason as `chips`.
 */
export const chipsInput = style(
  layered({
    flex: 1,
    minWidth: '4rem',
    height: vars.space['6'],
    paddingBlock: 0,
    paddingInlineStart: vars.space['2'],
    paddingInlineEnd: 0,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
    selectors: {
      '&::placeholder': { color: vars.color.fg.muted, opacity: 1 },
      '&:disabled': { cursor: 'not-allowed' },
    },
  }),
);
