import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const forced = '(forced-colors: active)';
const hover = '(hover: hover)';

/**
 * Padding inside the scroll container, so focus rings (a thick outline plus its offset)
 * aren't clipped. The underline bar sits at the bottom of this padding, on
 * the list's line.
 */
const listPadding = vars.space['1'];

export const list = style(
  layered({
    position: 'relative',
    display: 'flex',
    gap: vars.space['1'],
    padding: listPadding,
    // Scrolling a tab into view leaves room for its focus ring.
    scrollPaddingInline: listPadding,
    overflowX: 'auto',
    overflowY: 'hidden',
    // The thin scrollbar is the visible hint that more tabs are off-screen.
    scrollbarWidth: 'thin',
  }),
);

export const listVariant = styleVariants({
  underline: layered({
    borderBlockEnd: `${vars.borderWidth.thin} solid ${vars.color.border.subtle}`,
  }),
  pill: layered({}),
});

export const tab = style(
  layered({
    // Above the marker, so pill text stays on top.
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: vars.space['2'],
    border: 'none',
    background: 'transparent',
    color: vars.color.fg.muted,
    fontFamily: 'inherit',
    fontWeight: vars.font.weight.medium,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-active]': { color: vars.color.fg.default },
      '&[data-disabled]': {
        color: vars.color.fg.disabled,
        cursor: 'not-allowed',
      },
      // The selected marker in server HTML, before the Indicator takes over.
      '&[data-active]::after': {
        content: '""',
        position: 'absolute',
        zIndex: -1,
        pointerEvents: 'none',
      },
    },
  }),
);

export const tabVariant = styleVariants({
  underline: layered({
    borderRadius: vars.radius.sm,
    selectors: {
      '&[data-active]::after': {
        insetInline: 0,
        // Down through the list's padding, onto its line.
        insetBlockEnd: `calc(-1 * ${listPadding})`,
        borderBlockEnd: `${vars.borderWidth.thick} solid ${vars.color.bg.accent}`,
      },
    },
    '@media': {
      [hover]: {
        selectors: {
          '&:not([data-active], [data-disabled]):hover': {
            color: vars.color.fg.default,
          },
        },
      },
      [forced]: {
        selectors: {
          '&[data-active]::after': { borderBlockEndColor: 'Highlight' },
        },
      },
    },
  }),
  pill: layered({
    borderRadius: vars.radius.full,
    selectors: {
      '&[data-active]::after': {
        inset: 0,
        borderRadius: vars.radius.full,
        background: vars.color.bg.muted,
        border: `${vars.borderWidth.thin} solid ${vars.color.border.control}`,
      },
    },
    '@media': {
      [hover]: {
        selectors: {
          '&:not([data-active], [data-disabled]):hover': {
            color: vars.color.fg.default,
            background: vars.color.bg.muted,
          },
        },
      },
      [forced]: {
        selectors: {
          '&[data-active]::after': { borderColor: 'Highlight' },
        },
      },
    },
  }),
});

export const tabSize = styleVariants({
  sm: layered({
    height: vars.size.control.sm,
    paddingInline: vars.space['2'],
    fontSize: vars.font.size.sm,
  }),
  md: layered({
    height: vars.size.control.md,
    paddingInline: vars.space['3'],
    fontSize: vars.font.size.md,
  }),
});

export const tabIcon = style(
  layered({ display: 'inline-flex', flexShrink: 0 }),
);

/**
 * Base UI's sliding marker, positioned from the variables it sets. It's in the
 * server HTML with `hidden`, which Base UI removes once it has measured the
 * selected tab. It doesn't animate in, since it leaves `display: none`.
 */
export const indicator = style(
  layered({
    position: 'absolute',
    insetInlineStart: 0,
    zIndex: 0,
    pointerEvents: 'none',
    width: 'var(--active-tab-width)',
    transform: 'translateX(var(--active-tab-left))',
    transitionProperty: 'transform, width',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: { '&[hidden]': { display: 'none' } },
  }),
);

// Both markers use the same tokens and position, so the handoff can't be seen.
export const indicatorVariant = styleVariants({
  underline: layered({
    insetBlockEnd: 0,
    borderBlockEnd: `${vars.borderWidth.thick} solid ${vars.color.bg.accent}`,
    '@media': { [forced]: { borderBlockEndColor: 'Highlight' } },
  }),
  pill: layered({
    insetBlockStart: 'var(--active-tab-top)',
    height: 'var(--active-tab-height)',
    borderRadius: vars.radius.full,
    background: vars.color.bg.muted,
    border: `${vars.borderWidth.thin} solid ${vars.color.border.control}`,
    '@media': { [forced]: { borderColor: 'Highlight' } },
  }),
});

// The handoff: once the Indicator is shown, the CSS marker turns off. Only
// CSS, so it needs no React state or inline script, and if the Indicator is
// hidden again, the CSS marker returns.
globalStyle(
  `${list}:has(> ${indicator}:not([hidden])) ${tab}[data-active]::after`,
  {
    '@layer': { [componentsLayer]: { display: 'none' } },
  },
);
