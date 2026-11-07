import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const kbd = style(
  layered({
    fontFamily: vars.font.family.mono,
    fontFeatureSettings: 'normal',
    fontSize: `max(${vars.font.size.xs}, 0.8em)`,
    paddingInline: vars.space['1'],
    background: vars.color.bg.surface,
    color: vars.color.fg.default,
    borderStyle: 'solid',
    borderColor: vars.color.border.control,
    borderWidth: vars.borderWidth.thin,
    borderBottomWidth: vars.borderWidth.thick,
    borderRadius: vars.radius.sm,
  }),
);
