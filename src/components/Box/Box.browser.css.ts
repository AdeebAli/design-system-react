import { style } from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';

/** Stands in for a component's own padding, in its layer. */
export const componentPadding = style({
  '@layer': { [componentsLayer]: { padding: vars.space['1'] } },
});

/** A project's own unlayered rule, which should beat the grid count classes. */
export const projectThreeColumns = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
});
