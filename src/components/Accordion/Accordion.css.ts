import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const hover = '(hover: hover)';

export const root = style(layered({ display: 'block' }));

/** Lines between items, as borders so forced colors keeps them. */
export const item = style(
  layered({
    selectors: {
      '& + &': {
        borderBlockStartWidth: vars.borderWidth.thin,
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: vars.color.border.subtle,
      },
    },
  }),
);

export const heading = style(
  layered({ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }),
);

export const trigger = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vars.space['3'],
    inlineSize: '100%',
    paddingInline: vars.space['3'],
    paddingBlock: vars.space['2'],
    border: 0,
    background: 'none',
    font: 'inherit',
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.default,
    textAlign: 'start',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      // Inside the header, so a clipping parent such as a Card can't cut it.
      // Doubled to beat the shared ring's offset.
      '&:focus-visible:focus-visible': {
        outlineOffset: `calc(-1 * ${vars.borderWidth.thick})`,
      },
      '&[data-disabled]': { cursor: 'not-allowed', color: vars.color.fg.muted },
    },
    '@media': {
      [hover]: {
        selectors: {
          '&:hover:not([data-disabled])': {
            backgroundColor: vars.color.bg.muted,
          },
        },
      },
    },
  }),
);

export const size = styleVariants({
  sm: layered({
    minBlockSize: vars.space['8'],
    paddingBlock: vars.space['1'],
    fontSize: vars.font.size.sm,
  }),
  md: layered({ minBlockSize: vars.size.control.lg }),
});

export const title = style(layered({ minInlineSize: 0 }));

export const chevron = style(
  layered({
    flexShrink: 0,
    color: vars.color.fg.muted,
    transitionProperty: 'transform',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: { '[data-panel-open] > &': { transform: 'rotate(180deg)' } },
    '@media': {
      // Forced colors: the chevron takes the button's text color.
      '(forced-colors: active)': { color: 'inherit' },
    },
  }),
);

/** Animates height through Base UI's variable. Reduced motion zeroes the duration. */
export const panel = style(
  layered({
    overflow: 'hidden',
    blockSize: 'var(--accordion-panel-height)',
    transitionProperty: 'height',
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-starting-style], &[data-ending-style]': { blockSize: 0 },
    },
  }),
);

export const content = style(
  layered({
    paddingInline: vars.space['3'],
    paddingBlockEnd: vars.space['3'],
  }),
);
