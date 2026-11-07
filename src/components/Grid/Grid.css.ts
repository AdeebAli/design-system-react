import { style } from '@vanilla-extract/css';
import { layered } from '../../utils/recipe';

export const equalRows = style(layered({ gridAutoRows: '1fr' }));
