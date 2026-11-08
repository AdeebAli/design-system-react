import { createGlobalThemeContract } from '@vanilla-extract/css';
import { contractShape } from './shape';
import { tokenToVarName } from './varName';

/** The theme contract, as typed references to CSS variables (Spec 02). */
export const vars = createGlobalThemeContract(contractShape, (_value, path) =>
  tokenToVarName(path).slice(2),
);
