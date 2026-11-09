'use client';

import type { ElementType, ReactElement, ReactNode } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { ButtonBase, type ButtonBaseOwnProps } from './ButtonBase';

interface ButtonOwnProps extends ButtonBaseOwnProps {
  /** An `Icon` element before the text. A spinner replaces it while loading. */
  startIcon?: ReactElement;
  /** An `Icon` element after the text. */
  endIcon?: ReactElement;
  children?: ReactNode;
}

/** `Button`'s props. */
export type ButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  ButtonOwnProps
>;

/**
 * A button. It defaults to `type="button"`, so set `type="submit"` explicitly.
 * `as="a"` or a router link renders a real link styled as a button.
 */
export function Button<E extends ElementType = 'button'>(
  props: ButtonProps<E>,
) {
  // The props depend on the generic `as`, which ButtonBase reads as a record.
  const rest: object = props;
  return <ButtonBase component="Button" {...rest} />;
}
