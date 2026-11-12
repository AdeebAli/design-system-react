import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export const root = style(
  layered({
    display: 'inline-flex',
    flexShrink: 0,
    verticalAlign: 'middle',
  }),
);

export const svg = style(
  layered({
    flexShrink: 0,
    animationName: spin,
    // 0ms under reduced motion (Spec 02), which leaves it still and visible.
    animationDuration: `calc(${vars.motion.duration.slow} * 2.5)`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  }),
);

export const size = styleVariants(vars.size.icon, (value) =>
  layered({ width: value, height: value }),
);
