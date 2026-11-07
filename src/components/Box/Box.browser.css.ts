import { style } from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';

/** Stands in for a component's own padding, in its layer. */
export const componentPadding = style({
  '@layer': { [componentsLayer]: { padding: vars.space['1'] } },
});
