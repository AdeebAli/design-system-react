import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { breakpoints } from '../../tokens/breakpoints';
import { layered } from '../../utils/recipe';

const md = `screen and (min-width: ${breakpoints.md})`;
const hover = '(hover: hover)';
const forced = '(forced-colors: active)';

/** Visually hidden, but kept for assistive tech, as `VisuallyHidden` does. */
const hiddenRule = {
  position: 'absolute',
  inlineSize: vars.space.px,
  blockSize: vars.space.px,
  overflow: 'hidden',
  padding: 0,
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

/** The rail's rules apply only from `md` up, where `[data-collapsed]` is on the nav. */
const onRail = (rules: object) => ({
  '@media': { [md]: { selectors: { '[data-collapsed] &': rules } } },
});

/** Attached to the page edge: no radius, an end border, and a width that animates. */
export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    inlineSize: vars.size.sidebar,
    background: vars.color.bg.surface,
    borderInlineEndWidth: vars.borderWidth.thin,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: vars.color.border.surface,
    transitionProperty: 'inline-size',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    '@media': {
      [md]: {
        selectors: {
          '&[data-collapsed]': { inlineSize: vars.size.sidebarRail },
        },
      },
    },
  }),
);

/** Full viewport height, staying in view. Its links scroll inside it. */
export const sticky = style(
  layered({
    position: 'sticky',
    insetBlockStart: 0,
    blockSize: '100dvh',
    alignSelf: 'flex-start',
  }),
);

export const top = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    padding: vars.space['3'],
    ...onRail({ flexDirection: 'column', paddingInline: vars.space['1'] }),
  }),
);

export const brand = style(layered({ flex: 1, minInlineSize: 0 }));

/** Only from `md` up, through CSS. */
export const collapse = style(
  layered({
    flexShrink: 0,
    display: 'none',
    '@media': { [md]: { display: 'inline-flex' } },
  }),
);

/** Points the other way in a right-to-left context. */
export const chevron = style(
  layered({ selectors: { '&:dir(rtl)': { transform: 'scaleX(-1)' } } }),
);

export const links = style(
  layered({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
    paddingInline: vars.space['2'],
    paddingBlock: vars.space['2'],
  }),
);

/** No `tabIndex`: it always holds focusable links. */
export const scrolling = style(
  layered({
    minBlockSize: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  }),
);

export const footer = style(layered({ padding: vars.space['3'] }));

export const group = style(
  layered({ display: 'flex', flexDirection: 'column', gap: vars.space['1'] }),
);

/** Matches table headers (Spec 13). */
export const groupLabel = style(
  layered({
    paddingInline: vars.space['2'],
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    letterSpacing: vars.font.letterSpacing.wide,
    textTransform: 'uppercase',
    color: vars.color.fg.muted,
    ...onRail(hiddenRule),
  }),
);

export const list = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['0.5'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  }),
);

export const item = style(layered({ display: 'block' }));

export const link = style(
  layered({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    minBlockSize: vars.space['8'],
    paddingInline: vars.space['2'],
    borderRadius: vars.radius.md,
    fontSize: vars.font.size.md,
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.muted,
    textDecorationLine: 'none',
    transitionProperty: 'color, background-color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      // Inside the link, so the scrolling area can't clip it. Doubled to beat
      // the shared ring's offset.
      '&:focus-visible:focus-visible': {
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
      '&[data-active]': {
        background: vars.color.bg.accentSubtle,
        color: vars.color.fg.default,
      },
      // The active bar, so the signal isn't only color.
      '&[data-active]::before': {
        content: '""',
        position: 'absolute',
        insetInlineStart: 0,
        insetBlock: vars.space['1.5'],
        borderInlineStartWidth: vars.borderWidth.thick,
        borderInlineStartStyle: 'solid',
        borderInlineStartColor: vars.color.bg.accent,
        borderRadius: vars.radius.full,
      },
    },
    '@media': {
      [hover]: {
        selectors: {
          '&:hover:not([data-active])': {
            background: vars.color.bg.muted,
            color: vars.color.fg.default,
          },
        },
      },
      [forced]: {
        selectors: {
          '&[data-active]::before': { borderInlineStartColor: 'Highlight' },
        },
      },
      [md]: {
        selectors: {
          '[data-collapsed] &': { justifyContent: 'center', paddingInline: 0 },
        },
      },
    },
  }),
);

export const linkIcon = style(
  layered({ display: 'inline-flex', flexShrink: 0 }),
);

export const linkLabel = style(
  layered({
    flex: 1,
    minInlineSize: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ...onRail(hiddenRule),
  }),
);

/** On the rail, the badge becomes a dot, with its count visually hidden. */
export const badge = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    '@media': {
      [md]: {
        selectors: {
          '[data-collapsed] &': {
            position: 'absolute',
            insetBlockStart: vars.space['1'],
            insetInlineEnd: vars.space['1'],
          },
          '[data-collapsed] &::after': {
            content: '""',
            inlineSize: vars.space['2'],
            blockSize: vars.space['2'],
            borderRadius: vars.radius.full,
            background: vars.color.bg.accent,
          },
        },
      },
      [forced]: {
        selectors: {
          '&::after': { forcedColorAdjust: 'none', background: 'CanvasText' },
        },
      },
    },
  }),
);

export const badgeCount = style(
  layered({ display: 'inline-flex', ...onRail(hiddenRule) }),
);
