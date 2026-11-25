import type { ElementType } from 'react';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';

interface CenterOwnProps {
  /**
   * Which direction to center in. Vertical centering needs a height. One of
   * `'both'`, `'horizontal'`, or `'vertical'`.
   * @default 'both'
   */
  axis?: 'both' | 'horizontal' | 'vertical';
  /** Shrinks to fit its content, and sits in a line of text. @default false */
  inline?: boolean;
  /**
   * Overrides `flex` or `inline-flex`. A missing `base` keeps that default. One
   * of `'none'`, `'block'`, `'inline'`, `'inline-block'`, `'flex'`,
   * `'inline-flex'`, `'grid'`, or `'inline-grid'`. Responsive.
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

/** `Center`'s props. */
export type CenterProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  CenterOwnProps
>;

/** Centers its children. */
export function Center<E extends ElementType = 'div'>({
  axis = 'both',
  inline = false,
  display,
  ...props
}: CenterProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      display={withDefaultDisplay(display, inline ? 'inline-flex' : 'flex')}
      alignItems={axis === 'horizontal' ? undefined : 'center'}
      justifyContent={axis === 'vertical' ? undefined : 'center'}
      {...rest}
    />
  );
}
