'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ReactElement } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { useFieldControl } from '../Field/FieldContext';
import * as styles from './Input.css';

/** Input heights: 28, 36, and 44px. */
export type InputSize = 'sm' | 'md' | 'lg';

interface InputOwnProps {
  /** The height. @default 'md' */
  size?: InputSize;
  /** Marks the input invalid. @default From `Field` */
  invalid?: boolean;
  /** A decorative `Icon` element before the text. */
  startIcon?: ReactElement;
  /** A decorative `Icon` element after the text. */
  endIcon?: ReactElement;
}

/**
 * `Input`'s props. `ref` and native attributes go to the `input`;
 * `className`, `style`, and layout props go to its wrapper.
 */
export type InputProps = ComponentProps<'input', InputOwnProps>;

/** A text input. It keeps the native `value` and `onChange`, so it works with `register`. */
export function Input({
  size = 'md',
  invalid: invalidProp,
  disabled: disabledProp,
  startIcon,
  endIcon,
  className,
  style,
  ...props
}: InputProps) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const [layout, rest] = splitLayoutProps(props);

  return (
    <div
      className={cx(
        box(layout),
        styles.control,
        styles.wrapper,
        styles.size[size],
        className,
      )}
      style={style}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      {startIcon && <span className={styles.icon}>{startIcon}</span>}
      <BaseField.Control
        className={styles.input}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-required={field.required || undefined}
        {...rest}
      />
      {endIcon && <span className={styles.icon}>{endIcon}</span>}
    </div>
  );
}
