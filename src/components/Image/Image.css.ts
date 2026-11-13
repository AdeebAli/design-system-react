import { createVar, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';

/** The frame's aspect ratio, set inline from `ratio` or the intrinsic size. */
export const ratioVar = createVar();

export const frame = style(
  layered({
    position: 'relative',
    overflow: 'hidden',
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
    display: 'block',
    maxInlineSize: '100%',
    blockSize: 'auto',
    selectors: {
      [`${frame}[data-ratio] > &`]: { inlineSize: '100%', blockSize: '100%' },
    },
  }),
);

export const fit = styleVariants({
  cover: layered({ objectFit: 'cover' }),
  contain: layered({ objectFit: 'contain' }),
});

export const skeleton = style(
  layered({ position: 'absolute', inset: 0, borderRadius: 'inherit' }),
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
