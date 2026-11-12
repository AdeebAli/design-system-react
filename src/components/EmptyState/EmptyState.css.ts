import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const emptyState = recipe({
  base: layered({ textAlign: 'center' }),
  variants: {
    size: {
      md: layered({ padding: vars.space['8'] }),
      sm: layered({ padding: vars.space['4'] }),
    },
  },
  defaultVariants: { size: 'md' },
});
