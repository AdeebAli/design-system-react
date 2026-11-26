import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';

interface InsetOwnProps {
  /**
   * Padding on every side. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  space?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the start and end sides. `space` tokens (`'4'` is 16px, `'px'` is
   * 1px). Responsive.
   */
  x?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the top and bottom. `space` tokens (`'4'` is 16px, `'px'` is
   * 1px). Responsive.
   */
  y?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the top. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  top?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the bottom. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  bottom?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the start side: left in a left-to-right language. `space` tokens
   * (`'4'` is 16px, `'px'` is 1px). Responsive.
   */
  start?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the end side: right in a left-to-right language. `space` tokens
   * (`'4'` is 16px, `'px'` is 1px). Responsive.
   */
  end?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Sets `display`, which is otherwise left to the element. One of `'none'`,
   * `'block'`, `'inline'`, `'inline-block'`, `'flex'`, `'inline-flex'`,
   * `'grid'`, or `'inline-grid'`. Responsive.
   */
  display?: Responsive<
    | 'none'
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
  >;
}

/** `Inset`'s props. */
export type InsetProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  InsetOwnProps
>;

/**
 * Padding from the spacing scale.
 *
 * @example
 * ```tsx
 * <Inset x="4">Content</Inset>
 * ```
 */
export function Inset<E extends ElementType = 'div'>({
  space,
  x,
  y,
  top,
  bottom,
  start,
  end,
  ...props
}: InsetProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      padding={space}
      paddingX={x}
      paddingY={y}
      paddingTop={top}
      paddingBottom={bottom}
      paddingStart={start}
      paddingEnd={end}
      {...rest}
    />
  );
}
