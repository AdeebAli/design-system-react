import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { sprinkles } from './sprinkles.css';
import type { BoxStyleProps } from './types';

type AttributeValue<
  E extends ElementType,
  Name extends string,
> = Name extends keyof ComponentPropsWithRef<E>
  ? ComponentPropsWithRef<E>[Name]
  : never;

interface BoxOwnProps<E extends ElementType> extends BoxStyleProps {
  /** The element or component to render. @default 'div' */
  as?: E;
  /** Merged with the generated classes. */
  className?: string;
  /** The real `width` attribute, for elements that have one, such as `img`. */
  htmlWidth?: AttributeValue<E, 'width'>;
  /** The real `height` attribute, for elements that have one, such as `img`. */
  htmlHeight?: AttributeValue<E, 'height'>;
  /** The content. */
  children?: ReactNode;
}

/** `Box`'s props for a given element. */
export type BoxProps<E extends ElementType = 'div'> = BoxOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof BoxOwnProps<E>>;

function withoutNullish(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item != null),
  );
}

/**
 * Returns the class string for style props, for when wrapping with `Box` isn't
 * possible. Nullish values add nothing.
 */
export function box(props: BoxStyleProps): string {
  const defined = Object.fromEntries(
    Object.entries(props)
      .filter(([, value]) => value != null)
      .map(([name, value]) => [name, withoutNullish(value)]),
  );
  // The hand-written prop types are kept in sync with sprinkles by Box.test-d.tsx.
  return sprinkles(defined);
}

/** The primitive every component is built on. */
export function Box<E extends ElementType = 'div'>(props: BoxProps<E>) {
  // A generic `as` can't be narrowed, so its props are read as a plain record.
  const { as, className, htmlWidth, htmlHeight, ...rest } = props as Record<
    string,
    unknown
  > & {
    as?: ElementType;
    className?: string;
    htmlWidth?: unknown;
    htmlHeight?: unknown;
  };

  const styleProps: Record<string, unknown> = {};
  const forwarded: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(rest)) {
    (sprinkles.properties.has(name as never) ? styleProps : forwarded)[name] =
      value;
  }

  const Element = as ?? 'div';
  const classes = cx(box(styleProps), className);

  return (
    <Element
      {...forwarded}
      {...(htmlWidth !== undefined && { width: htmlWidth })}
      {...(htmlHeight !== undefined && { height: htmlHeight })}
      className={classes || undefined}
    />
  );
}
