'use client';

import type { ElementType, ReactElement } from 'react';
import type { PolymorphicProps } from '../../utils/types';
import { ButtonBase, type ButtonBaseOwnProps } from '../Button/ButtonBase';

interface IconButtonOwnProps extends ButtonBaseOwnProps {
  /** The `Icon` element. It stays decorative, so `aria-label` names the button. */
  icon: ReactElement;
  /** The button's name, since it has no visible text. */
  'aria-label': string;
}

/** `IconButton`'s props. */
export type IconButtonProps<E extends ElementType = 'button'> =
  PolymorphicProps<E, IconButtonOwnProps>;

/**
 * A square button with only an icon.
 *
 * @example
 * ```tsx
 * <IconButton
 *   aria-label="Add item"
 *   icon={
 *     <Icon
 *       icon={(props) => (
 *         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
 *           <path d="M12 5v14M5 12h14" />
 *         </svg>
 *       )}
 *     />
 *   }
 * />
 * ```
 */
export function IconButton<E extends ElementType = 'button'>({
  icon,
  ...props
}: IconButtonProps<E>) {
  // The props depend on the generic `as`, which ButtonBase reads as a record.
  const rest: object = props;
  return (
    <ButtonBase component="IconButton" square {...rest}>
      {!props.loading && icon}
    </ButtonBase>
  );
}
