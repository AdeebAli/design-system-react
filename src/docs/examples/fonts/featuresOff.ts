import { defineTheme } from '../../../index';

// Turns off Inter's cv05 and cv08 alternates.
export const plainInter = defineTheme({
  shared: { font: { features: { sans: 'normal' } } },
});
