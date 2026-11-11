import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The outer element: the table, then `Pagination` beneath it. */
export const root = style(
  layered({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['3'],
  }),
);
