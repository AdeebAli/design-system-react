import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../../index';

// A project's own vanilla-extract styles read the same tokens through vars.
// Breakpoints are static strings, because media queries can't read variables.
export const tokenCard = style({
  padding: vars.space['4'],
  borderRadius: vars.radius.card,
  background: vars.color.bg.surface,
  boxShadow: vars.shadow.card,
  color: vars.color.fg.default,
  '@media': {
    [`(min-width: ${breakpoints.md})`]: {
      padding: vars.space['6'],
    },
  },
});
