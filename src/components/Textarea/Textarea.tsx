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
  id,
  name,
  value,
  defaultValue,
  autoFocus,
  ...props
}: TextareaProps) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  // A disabled Field wins, so the control can't be enabled inside it.
  const disabled = field.disabled || disabledProp === true;
  const [layout, rest] = splitLayoutProps(props);

  return (
    <BaseField.Control
      // Field.Control reads these itself: the id for the label, the value to
      // know whether it's controlled, and the name for the form.
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      // Forwards the project's own prop; the component never sets it.
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      // It's typed for an input, so the textarea's other props go on the
      // rendered element, which Base UI merges, and keep their types.
      render={<textarea {...rest} />}
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
    />
  );
}
