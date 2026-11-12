import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const { bg, fg } = vars.color;

export const root = style(
  layered({
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.space['3'],
    padding: vars.space['3'],
    borderRadius: vars.radius.md,
    // Transparent, so it shows only in forced colors, where it keeps the edge.
    border: `${vars.borderWidth.thin} solid transparent`,
    color: fg.default,
    fontSize: vars.font.size.sm,
    lineHeight: vars.font.lineHeight.normal,
  }),
);

export const tone = styleVariants({
  info: layered({ background: bg.infoSubtle }),
  success: layered({ background: bg.successSubtle }),
  warning: layered({ background: bg.warningSubtle }),
  danger: layered({ background: bg.dangerSubtle }),
});

/** The icon takes the tone's text color, unless it sets its own. */
export const icon = styleVariants({
  info: layered({ color: fg.info }),
  success: layered({ color: fg.success }),
  warning: layered({ color: fg.warning }),
  danger: layered({ color: fg.danger }),
});

export const iconSlot = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    // Centers a 1rem icon on the first line of text.
    marginBlockStart: `calc((1em * ${vars.font.lineHeight.normal} - ${vars.size.icon.md}) / 2)`,
  }),
);

export const content = style(
  layered({
    flex: '1 1 auto',
    minInlineSize: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: vars.space['1'],
  }),
);

export const title = style(layered({ fontWeight: vars.font.weight.semibold }));

export const body = style(layered({ minInlineSize: 0 }));

export const action = style(layered({ marginBlockStart: vars.space['2'] }));

export const dismiss = style(
  layered({
    flexShrink: 0,
    // Pulls the small button into the padding, so the text keeps its line.
    marginBlock: `calc(${vars.space['1']} * -1)`,
    marginInlineEnd: `calc(${vars.space['1']} * -1)`,
  }),
);
