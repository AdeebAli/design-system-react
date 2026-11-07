import { style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const code = style(
  layered({
    fontFamily: vars.font.family.mono,
    fontFeatureSettings: 'normal',
    // Plex Mono looks larger than Inter at the same size.
    fontSize: `max(${vars.font.size.xs}, 0.88em)`,
    paddingInline: vars.space['1'],
    background: vars.color.bg.sunken,
    // Set explicitly, because inherited text may be too light on this background.
    color: vars.color.fg.default,
    borderRadius: vars.radius.sm,
    selectors: {
      'pre &': {
        fontSize: 'inherit',
        paddingInline: 0,
        background: 'transparent',
        borderRadius: 0,
      },
    },
  }),
);
