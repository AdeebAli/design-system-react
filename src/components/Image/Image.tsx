'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { PolymorphicProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import { Box } from '../Box';
import type { DisplayValue, Responsive } from '../Box/types';
import { Icon } from '../Icon';
import { ImageOffIcon } from '../Icon/internal/ImageOff';
import { Skeleton } from '../Skeleton';
import * as styles from './Image.css';
import { aspectRatio, type ImageRatio } from './ratio';

/** The custom property behind `ratioVar`, for the frame's inline style. */
const ratioProperty = styles.ratioVar.slice('var('.length, -1);

interface ImageOwnProps {
  /** The image's text alternative. Required: `""` marks it decorative. */
  alt: string;
  /**
   * The frame's shape: a preset, or any positive number, such as `16 / 10`.
   * @default the `htmlWidth` / `htmlHeight` ratio when both are set
   */
  ratio?: ImageRatio | number;
  /** How the image fills a `ratio` frame. @default 'cover' */
  fit?: 'cover' | 'contain';
  /** The corners, from `radius.*`. @default `radius.image` */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Shows a `Skeleton` in the frame until the image loads. @default false */
  skeleton?: boolean;
  /** Shown if the image fails. `null` leaves an empty frame. @default an image-off icon */
  fallback?: ReactNode;
  /** The image's intrinsic width, passed to the `as` element as `width`. */
  htmlWidth?: number;
  /** The image's intrinsic height, passed to the `as` element as `height`. */
  htmlHeight?: number;
  /** The frame's display. @default 'block' */
  display?: Responsive<DisplayValue>;
}

/** `Image`'s props. `src` and the other native props come from `as`. */
export type ImageProps<E extends ElementType = 'img'> = PolymorphicProps<
  E,
  ImageOwnProps
>;

interface Settled {
  src: unknown;
  status: 'loaded' | 'error';
}

/** Sets a ref, returning its cleanup (React 19 ref callbacks). */
function setRef<T>(ref: Ref<T> | undefined, value: T): () => void {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    return typeof cleanup === 'function' ? cleanup : () => ref(null);
  }
  if (ref) ref.current = value;
  return () => {
    if (ref) ref.current = null;
  };
}

/**
 * An image in a frame that reserves its space, with an optional skeleton while
 * it loads and a fallback if it fails. `as` renders it through a framework's
 * image component, such as `next/image`.
 */
export function Image<E extends ElementType = 'img'>({
  as,
  alt,
  ratio,
  fit = 'cover',
  radius,
  skeleton = false,
  fallback,
  htmlWidth,
  htmlHeight,
  display,
  className,
  style,
  ...props
}: ImageProps<E>) {
  // These depend on the generic `as`, which TypeScript can't narrow.
  const { ref, src, onLoad, onError, ...native } = props as {
    ref?: Ref<HTMLElement>;
    src?: unknown;
    onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  };
  const [layout, rest] = splitLayoutProps(native);

  const [settled, setSettled] = useState<Settled | null>(null);
  const status =
    settled && settled.src === src ? settled.status : ('loading' as const);
  const ratioValue = aspectRatio(ratio, htmlWidth, htmlHeight);

  const node = useRef<HTMLElement | null>(null);
  // The project's ref gets the img once, and again only when it or `as`
  // changes, not on every render.
  useLayoutEffect(() => setRef(ref, node.current), [ref, as]);

  // The browser may have finished before React attached onLoad and onError,
  // before hydration or when a new src is already cached.
  useLayoutEffect(() => {
    const element = node.current;
    if (!(element instanceof HTMLImageElement)) {
      warnOnce(
        'Image-ref',
        'Image: the `as` component must forward `ref` to an `img` element.',
      );
      return;
    }
    if (!element.complete) return;
    if (element.naturalWidth > 0) {
      setSettled({ src, status: 'loaded' });
      return;
    }
    // Some browsers report 0 for an SVG with no intrinsic size, so a 0 is a
    // failure only if the image can't be decoded.
    let current = true;
    element.decode().then(
      () => current && setSettled({ src, status: 'loaded' }),
      () => current && setSettled({ src, status: 'error' }),
    );
    return () => {
      current = false;
    };
  }, [src]);

  const sized = ratioValue !== undefined || layout.height != null;
  const empty = (skeleton && status === 'loading') || status === 'error';
  useEffect(() => {
    if (!sized && empty) {
      warnOnce(
        'Image-size',
        'Image: with no `ratio`, `htmlWidth` and `htmlHeight`, or `height`, its skeleton or fallback has no height. Set one of them.',
      );
    }
  }, [sized, empty]);

  // Image's state commits first, so the project's handler sees it.
  const settle =
    (next: Settled['status'], handler?: typeof onLoad) =>
    (event: SyntheticEvent<HTMLImageElement>) => {
      flushSync(() => setSettled({ src, status: next }));
      handler?.(event);
    };

  const Element: ElementType = as ?? 'img';
  const showFallback = status === 'error' && fallback !== null;

  return (
    <Box
      as="span"
      display={withDefaultDisplay(display, 'block')}
      {...layout}
      className={cx(styles.frame, radius && styles.radius[radius], className)}
      style={ratioValue ? { ...style, [ratioProperty]: ratioValue } : style}
      data-ratio={ratioValue ? '' : undefined}
      data-loading={status === 'loading' ? '' : undefined}
      data-error={status === 'error' ? '' : undefined}
    >
      {skeleton && status === 'loading' && (
        <Skeleton as="span" className={styles.skeleton} />
      )}
      <Element
        {...rest}
        ref={node}
        src={src}
        alt={alt}
        width={htmlWidth}
        height={htmlHeight}
        className={cx(styles.img, styles.fit[fit])}
        onLoad={settle('loaded', onLoad)}
        onError={settle('error', onError)}
      />
      {showFallback && (
        <span aria-hidden="true" className={styles.fallback}>
          {fallback ?? <Icon icon={ImageOffIcon} size="md" />}
        </span>
      )}
    </Box>
  );
}
