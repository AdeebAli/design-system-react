import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const hover = '(hover: hover)';
const forced = '(forced-colors: active)';

// Lucide's chevron-right, drawn as a mask so it takes `currentColor`.
const chevron = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
)}")`;

export const root = style(layered({ display: 'block' }));

export const size = styleVariants({
  sm: layered({ fontSize: vars.font.size.sm }),
  md: layered({ fontSize: vars.font.size.md }),
});

export const list = style(
  layered({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 0,
    columnGap: vars.space['1'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.muted,
  }),
);

/** Each item after the first starts with a separator, hidden from screen readers by having no text. */
export const item = style(
  layered({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['1'],
    minInlineSize: 0,
    overflowWrap: 'anywhere',
    selectors: {
      '& + &::before': {
        content: '""',
        flexShrink: 0,
        inlineSize: vars.size.icon.sm,
        blockSize: vars.size.icon.sm,
        backgroundColor: 'currentColor',
        maskImage: chevron,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
      },
      '& + &:dir(rtl)::before': { transform: 'scaleX(-1)' },
    },
    '@media': {
      // Forced colors would paint the mask's background as Canvas, hiding it.
      [forced]: {
        selectors: {
          '& + &::before': {
            forcedColorAdjust: 'none',
            backgroundColor: 'CanvasText',
          },
        },
      },
    },
  }),
);

/** At least `space.6` tall, the WCAG 2.5.8 minimum target. */
const target = {
  display: 'inline-flex',
  alignItems: 'center',
  minBlockSize: vars.space['6'],
} as const;

export const link = style(
  layered({
    ...target,
    color: 'inherit',
    textDecorationLine: 'none',
    borderRadius: vars.radius.sm,
    '@media': {
      [hover]: {
        selectors: { '&:hover': { textDecorationLine: 'underline' } },
      },
    },
  }),
);

export const current = style(
  layered({
    ...target,
    color: vars.color.fg.default,
    fontWeight: vars.font.weight.medium,
  }),
);
