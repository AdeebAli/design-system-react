import { assignVars, globalStyle } from '@vanilla-extract/css';
import { vars } from '../themes/contract.css';
import { softDark } from '../themes/softDark';
import { softLight } from '../themes/softLight';
import { themeLayer } from './layers.css';

const light = { colorScheme: 'light', vars: assignVars(vars, softLight) };
const dark = { colorScheme: 'dark', vars: assignVars(vars, softDark) };

globalStyle(':root', { '@layer': { [themeLayer]: light } });

globalStyle(':root:not([data-ds-mode])', {
  '@layer': {
    [themeLayer]: { '@media': { '(prefers-color-scheme: dark)': dark } },
  },
});

globalStyle(":root[data-ds-mode='dark']", {
  '@layer': { [themeLayer]: dark },
});

// Emitted last, with a selector matching the mode rules' specificity, so it
// wins in a locked mode too (Spec 02: no exceptions).
globalStyle(':root:not([data-ds-mode]), :root[data-ds-mode]', {
  '@layer': {
    [themeLayer]: {
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          vars: {
            [vars.motion.duration.fast]: '0ms',
            [vars.motion.duration.base]: '0ms',
            [vars.motion.duration.slow]: '0ms',
          },
        },
      },
    },
  },
});
