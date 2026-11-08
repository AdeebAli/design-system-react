import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg } = vars.color;

export const trigger = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vars.space['2'],
    width: '100%',
    minWidth: 0,
    paddingInline: vars.space['3'],
    textAlign: 'start',
    cursor: 'pointer',
    selectors: {
      '&:focus-visible': {
        outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
        outlineOffset: vars.space['0.5'],
      },
    },
  }),
);

export const value = style(
  layered({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    selectors: { '&[data-placeholder]': { color: fg.muted } },
  }),
);

export const chevron = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    width: vars.size.icon.md,
    height: vars.size.icon.md,
    color: fg.muted,
  }),
);

export const positioner = style(
  layered({ zIndex: vars.zIndex.popover, outline: 'none' }),
);

export const popup = style(
  layered({
    boxSizing: 'border-box',
    minWidth: 'var(--anchor-width)',
    maxHeight: 'var(--available-height)',
    overflowY: 'auto',
    padding: vars.space['1'],
    background: bg.raised,
    color: fg.default,
    borderRadius: vars.radius.lg,
    boxShadow: vars.shadow.raised,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars.color.border.surface,
    fontSize: vars.font.size.md,
    outline: 'none',
    transformOrigin: 'var(--transform-origin)',
    transitionProperty: 'opacity, transform',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.enter,
    selectors: {
      '&[data-starting-style], &[data-ending-style]': {
        opacity: 0,
        transform: 'scale(0.98)',
      },
    },
  }),
);

export const group = style(
  layered({ display: 'flex', flexDirection: 'column' }),
);

export const groupLabel = style(
  layered({
    paddingBlock: vars.space['1'],
    paddingInline: vars.space['2'],
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    color: fg.muted,
  }),
);

export const item = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vars.space['2'],
    minHeight: vars.size.control.sm,
    paddingInline: vars.space['2'],
    borderRadius: vars.radius.md,
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    selectors: {
      '&[data-highlighted]': { background: bg.muted },
      '&[data-selected]': { fontWeight: vars.font.weight.medium },
      '&[data-disabled]': { color: fg.disabled, cursor: 'not-allowed' },
    },
    // A system highlight, since backgrounds are replaced in forced colors.
    '@media': {
      '(forced-colors: active)': {
        selectors: {
          '&[data-highlighted]': {
            outline: '2px solid Highlight',
            outlineOffset: '-2px',
          },
        },
      },
    },
  }),
);

export const indicator = style(
  layered({
    display: 'inline-flex',
    width: vars.size.icon.md,
    height: vars.size.icon.md,
    color: fg.accent,
  }),
);
