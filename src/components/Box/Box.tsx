import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { warnOnce } from '../../utils/warn';
import {
  GRID_COUNT_PROPS,
  gridCountStyle,
  withGridVariables,
  type GridCountProps,
} from './gridCounts';
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

const isGridCount = (name: string) =>
  (GRID_COUNT_PROPS as readonly string[]).includes(name);

function withoutNullish(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item != null),
  );
}

/**
 * Returns the class string for style props, for when wrapping with `Box` isn't
 * possible. Nullish values add nothing. It doesn't take grid counts
 * (`gridTemplateColumns`, `gridColumn`, `gridRow`): wrap the element in `Box`,
 * or use `style`.
 */
export function box(props: Omit<BoxStyleProps, keyof GridCountProps>): string {
  const defined = Object.fromEntries(
    Object.entries(props)
      .filter(([name, value]) => {
        if (value == null) return false;
        if (!isGridCount(name)) return true;
        // From untyped code only: the types reject these (ADR 0005).
        warnOnce(
          `box-grid-count-${name}`,
          `box(): ${name} isn't supported, so it's ignored. For grid placement of another component, wrap it in \`Box\` or use \`style\`.`,
        );
        return false;
      })
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
  const gridProps: Record<string, unknown> = {};
  const forwarded: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(rest)) {
    const target = (GRID_COUNT_PROPS as readonly string[]).includes(name)
      ? gridProps
      : sprinkles.properties.has(name as never)
        ? styleProps
        : forwarded;
    target[name] = value;
  }

  const Element = as ?? 'div';
  const grid = gridCountStyle(gridProps, 'Box');
  const classes = cx(box(styleProps), grid.className, className);

  return (
    <Element
      {...forwarded}
      {...(htmlWidth !== undefined && { width: htmlWidth })}
      {...(htmlHeight !== undefined && { height: htmlHeight })}
      {...(grid.style && {
        style: withGridVariables(grid.style, forwarded.style),
      })}
      className={classes || undefined}
    />
  );
}
