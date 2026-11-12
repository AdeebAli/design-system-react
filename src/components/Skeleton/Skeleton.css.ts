import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

// Reduced motion zeroes motion.duration.*, so this becomes 0ms and the block
// stays still and fully visible.
const block = {
  background: vars.color.bg.mutedHover,
  // Keeps it visible in forced colors, where the background is dropped.
  border: '1px solid transparent',
  animationName: pulse,
  animationDuration: `calc(${vars.motion.duration.slow} * 5)`,
  animationTimingFunction: vars.motion.easing.standard,
  animationIterationCount: 'infinite',
} as const;

export const rect = style(layered({ ...block, borderRadius: vars.radius.md }));

export const circle = style(
  layered({ ...block, borderRadius: vars.radius.full }),
);

/** One line of text: 1em tall, with a gap below it to the next line. */
export const line = style(
  layered({
    ...block,
    display: 'block',
    borderRadius: vars.radius.sm,
    height: '1em',
    selectors: {
      '&:not(:last-child)': { marginBlockEnd: '0.5em' },
    },
  }),
);

/** The last of several lines. */
export const lastLine = style(layered({ inlineSize: '60%' }));
