import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

// A border, not a background, so it stays visible in forced colors.
const line = `${vars.borderWidth.thin} solid ${vars.color.border.subtle}`;

export const horizontal = style(
  layered({
    margin: 0,
    border: 0,
    borderBlockStart: line,
    blockSize: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
  }),
);

export const vertical = style(
  layered({
    inlineSize: 0,
    borderInlineStart: line,
    alignSelf: 'stretch',
    flexShrink: 0,
  }),
);

const rule = layered({
  content: '""',
  flex: '1 1 0',
  minInlineSize: vars.space['4'],
  borderBlockStart: line,
});

export const labeled = style(
  layered({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    alignSelf: 'stretch',
    fontSize: vars.font.size.xs,
    lineHeight: vars.font.lineHeight.normal,
    color: vars.color.fg.muted,
    textAlign: 'center',
    selectors: { '&::before': rule, '&::after': rule },
  }),
);

export const labelText = style(layered({ minInlineSize: 0 }));
