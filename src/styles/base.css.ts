import { globalStyle } from '@vanilla-extract/css';
import { vars } from '../themes/contract.css';
import { baseLayer } from './layers.css';

globalStyle('body', {
  '@layer': {
    [baseLayer]: {
      backgroundColor: vars.color.bg.canvas,
      color: vars.color.fg.default,
      fontFamily: vars.font.family.sans,
      fontFeatureSettings: vars.font.features.sans,
      fontOpticalSizing: 'auto',
      fontSize: vars.font.size.md,
      fontWeight: vars.font.weight.regular,
      lineHeight: vars.font.lineHeight.normal,
    },
  },
});
