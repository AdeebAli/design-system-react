'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { useFieldControl } from '../Field/FieldContext';
import * as styles from '../Input/Input.css';

interface TextareaOwnProps {
  /** Whether people can resize it. @default 'vertical' */
  resize?: 'vertical' | 'none';
  /** Marks the textarea invalid. @default From `Field` */
  invalid?: boolean;
}

/** `Textarea`'s props. Everything, including `ref`, goes to the `textarea`. */
export type TextareaProps = ComponentProps<'textarea', TextareaOwnProps>;

/** A multi-line text input, at least two rows tall. */
export function Textarea({
  resize = 'vertical',
  invalid: invalidProp,
  disabled: disabledProp,
  className,
  ...props
}: TextareaProps) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const [layout, rest] = splitLayoutProps(props);

  return (
    <BaseField.Control
      render={<textarea />}
      className={cx(
        box(layout),
        styles.control,
        styles.textarea,
        styles.resize[resize],
        className,
      )}
      disabled={disabled}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      aria-invalid={invalid || undefined}
      aria-required={field.required || undefined}
      {...(rest as object)}
    />
  );
}
