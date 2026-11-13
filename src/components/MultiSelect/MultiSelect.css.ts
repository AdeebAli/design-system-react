import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The trigger's summary: the first label, truncated, and the count. */
export const summary = style(
  layered({
    display: 'flex',
    alignItems: 'baseline',
    gap: vars.space['1'],
    minWidth: 0,
  }),
);

export const first = style(
  layered({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
);

export const count = style(
  layered({
    flexShrink: 0,
    color: vars.color.fg.muted,
    whiteSpace: 'nowrap',
  }),
);
