import { styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const tone = styleVariants({
  accent: layered({ color: vars.color.fg.accent }),
  // Explicit, so a parent's link color (such as Prose's) doesn't apply.
  neutral: layered({ color: 'inherit' }),
});

export const underline = styleVariants({
  always: layered({ textDecorationLine: 'underline' }),
  hover: layered({
    textDecorationLine: 'none',
    selectors: { '&:hover': { textDecorationLine: 'underline' } },
  }),
});
