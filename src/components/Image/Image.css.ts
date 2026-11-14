import {
  createVar,
  globalStyle,
  style,
  styleVariants,
} from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The frame's aspect ratio, set inline from `ratio` or the intrinsic size. */
export const ratioVar = createVar();

export const frame = style(
  layered({
    position: 'relative',
    overflow: 'hidden',
    // The forced-colors border doesn't change its size.
    boxSizing: 'border-box',
    maxInlineSize: '100%',
    borderRadius: vars.radius.image,
    selectors: {
      '&[data-ratio]': { aspectRatio: ratioVar, inlineSize: '100%' },
    },
  }),
);

export const radius = styleVariants(
  {
    none: 'none',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
  } as const,
  (token) => layered({ borderRadius: vars.radius[token] }),
);

export const img = style(
  layered({
    // Positioned, so it paints over the absolutely placed skeleton, even
    // before hydration.
    position: 'relative',
    display: 'block',
    maxInlineSize: '100%',
    blockSize: 'auto',
    // Its own corners, so Prose's img rule (radius.image) doesn't reach it.
    borderRadius: 'inherit',
    selectors: {
      [`${frame}[data-ratio] > &`]: { inlineSize: '100%', blockSize: '100%' },
      // Hidden, not removed, so its alt still names it and a broken-image
      // icon never shows.
      [`${frame}[data-error] > &`]: { opacity: 0 },
    },
  }),
);

export const fit = styleVariants({
  cover: layered({ objectFit: 'cover' }),
  contain: layered({ objectFit: 'contain' }),
});

export const skeleton = style(
  layered({
    selectors: {
      // The frame's child selector outranks Skeleton's own radius.
      [`${frame} > &`]: {
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
      },
    },
  }),
);

export const fallback = style(
  layered({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    background: vars.color.bg.muted,
    color: vars.color.fg.muted,
  }),
);

// Keeps the frame's edge visible in forced colors, where the skeleton's and
// the fallback's backgrounds are dropped. A loaded image needs none.
globalStyle(`${frame}:has(> ${skeleton}), ${frame}:has(> ${fallback})`, {
  '@layer': {
    [componentsLayer]: {
      '@media': {
        '(forced-colors: active)': {
          border: `${vars.borderWidth.thin} solid transparent`,
        },
      },
    },
  },
});
