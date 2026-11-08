import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const card = recipe({
  base: layered({
    borderRadius: vars.radius.card,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars.color.border.surface,
    // Lets a grid cell shrink below a long unbroken word (Spec 08).
    minWidth: 0,
    overflowWrap: 'anywhere',
  }),
  variants: {
    surface: {
      default: layered({
        background: vars.color.bg.surface,
        boxShadow: vars.shadow.card,
      }),
      sunken: layered({ background: vars.color.bg.sunken, boxShadow: 'none' }),
    },
    clip: {
      true: layered({ overflow: 'hidden' }),
      false: {},
    },
  },
  defaultVariants: { surface: 'default', clip: false },
});

export const interactive = style(
  layered({
    color: 'inherit',
    textDecorationLine: 'none',
    transitionProperty: 'transform',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    '@media': {
      '(hover: hover)': {
        selectors: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: vars.shadow.cardHover,
          },
        },
      },
    },
    selectors: {
      '&:active': { transform: 'none' },
    },
  }),
);
