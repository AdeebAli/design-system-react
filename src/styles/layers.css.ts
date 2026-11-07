import { globalLayer } from '@vanilla-extract/css';

// Declared in order. scripts/build-fonts.mjs also puts this order first in the
// published stylesheet.
export const themeLayer = globalLayer('ds.theme');
export const resetLayer = globalLayer('ds.reset');
export const baseLayer = globalLayer('ds.base');
export const componentsLayer = globalLayer('ds.components');
export const utilitiesLayer = globalLayer('ds.utilities');
