import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import { utilitiesLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { breakpoints } from '../../tokens/breakpoints';

type LineHeight = keyof typeof vars.font.lineHeight;
type LetterSpacing = keyof typeof vars.font.letterSpacing;

function sized(
  fontSize: string,
  lineHeight: LineHeight,
  letterSpacing: LetterSpacing,
) {
  return {
    fontSize,
    lineHeight: vars.font.lineHeight[lineHeight],
    letterSpacing: vars.font.letterSpacing[letterSpacing],
  };
}

const { size } = vars.font;

const properties = defineProperties({
  '@layer': utilitiesLayer,
  conditions: {
    base: {},
    sm: { '@media': `screen and (min-width: ${breakpoints.sm})` },
    md: { '@media': `screen and (min-width: ${breakpoints.md})` },
    lg: { '@media': `screen and (min-width: ${breakpoints.lg})` },
    xl: { '@media': `screen and (min-width: ${breakpoints.xl})` },
  },
  defaultCondition: 'base',
  properties: {
    size: {
      xs: sized(size.xs, 'normal', 'normal'),
      sm: sized(size.sm, 'normal', 'normal'),
      md: sized(size.md, 'normal', 'normal'),
      lg: sized(size.lg, 'normal', 'normal'),
      xl: sized(size.xl, 'normal', 'normal'),
      '2xl': sized(size['2xl'], 'snug', 'tight'),
      '3xl': sized(size['3xl'], 'tight', 'tighter'),
      '4xl': sized(size['4xl'], 'tight', 'tighter'),
      '5xl': sized(size['5xl'], 'tight', 'tighter'),
    },
    align: {
      start: { textAlign: 'start' },
      center: { textAlign: 'center' },
      end: { textAlign: 'end' },
    },
  },
});

/** `size` and `align`, which Spec 04 keeps off `Box`. */
export const typography = createSprinkles(properties);
