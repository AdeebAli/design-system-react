import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const icon = recipe({
  base: layered({
    // The reset makes svg a block, which wouldn't sit in a line of text.
    display: 'inline-block',
    flexShrink: 0,
    verticalAlign: '-0.125em',
  }),
  variants: {
    size: {
      sm: layered({ width: vars.size.icon.sm, height: vars.size.icon.sm }),
      md: layered({ width: vars.size.icon.md, height: vars.size.icon.md }),
      lg: layered({ width: vars.size.icon.lg, height: vars.size.icon.lg }),
      inherit: layered({ width: '1em', height: '1em' }),
    },
    tone: {
      muted: layered({ color: vars.color.fg.muted }),
      accent: layered({ color: vars.color.fg.accent }),
      success: layered({ color: vars.color.fg.success }),
      warning: layered({ color: vars.color.fg.warning }),
      danger: layered({ color: vars.color.fg.danger }),
      info: layered({ color: vars.color.fg.info }),
    },
  },
});

export type IconVariants = NonNullable<RecipeVariants<typeof icon>>;
