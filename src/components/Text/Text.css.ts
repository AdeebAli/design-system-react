import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

export const weight = styleVariants({
  regular: layered({ fontWeight: vars.font.weight.regular }),
  medium: layered({ fontWeight: vars.font.weight.medium }),
  semibold: layered({ fontWeight: vars.font.weight.semibold }),
  bold: layered({ fontWeight: vars.font.weight.bold }),
});

export const tone = styleVariants({
  muted: layered({ color: vars.color.fg.muted }),
  accent: layered({ color: vars.color.fg.accent }),
  success: layered({ color: vars.color.fg.success }),
  warning: layered({ color: vars.color.fg.warning }),
  danger: layered({ color: vars.color.fg.danger }),
  info: layered({ color: vars.color.fg.info }),
});

export const family = styleVariants({
  sans: layered({
    fontFamily: vars.font.family.sans,
    fontFeatureSettings: vars.font.features.sans,
  }),
  // Inter's alternates are inherited, and don't apply to other fonts.
  mono: layered({
    fontFamily: vars.font.family.mono,
    fontFeatureSettings: 'normal',
  }),
  prose: layered({
    fontFamily: vars.font.family.prose,
    fontFeatureSettings: 'normal',
  }),
});

export const numeric = style(layered({ fontVariantNumeric: 'tabular-nums' }));

export const truncate = style(
  layered({
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
);

function clamp(lines: number) {
  return layered({
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
  });
}

export const lineClamp = styleVariants({
  2: clamp(2),
  3: clamp(3),
  4: clamp(4),
  5: clamp(5),
  6: clamp(6),
});
