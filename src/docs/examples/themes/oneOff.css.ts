import { style } from '@vanilla-extract/css';
import { vars } from '../../../index';

export const promo = style({
  backgroundImage: `linear-gradient(135deg, ${vars.color.bg.accentSubtle}, ${vars.color.bg.surface})`,
});
