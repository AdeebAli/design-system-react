import { style } from '@vanilla-extract/css';
import { vars } from '../themes/contract.css';
import { componentsLayer } from './layers.css';

/** The shared focus ring: 2px, offset 2px, on :focus-visible only (Spec 02). */
export const focusRing = style({
  '@layer': {
    [componentsLayer]: {
      selectors: {
        '&:focus-visible': {
          outline: `${vars.borderWidth.thick} solid ${vars.color.focus}`,
          outlineOffset: vars.space['0.5'],
        },
      },
    },
  },
});
