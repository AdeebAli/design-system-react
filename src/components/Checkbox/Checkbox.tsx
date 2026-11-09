'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ReactNode, Ref } from 'react';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { useFieldControl } from '../Field/FieldContext';
import { CheckIcon } from '../Icon/internal/Check';
import { MinusIcon } from '../Icon/internal/Minus';
import * as styles from './choice.css';
import { ChoiceLabel } from './ChoiceLabel';
import { warnIfUnnamed } from './useChoiceName';

interface CheckboxOwnProps {
  /** The checkbox's label. The whole label is clickable. */
  label?: ReactNode;
  /** Help text below the label. */
  hint?: ReactNode;
  /** Whether it's checked, when controlled. */
  checked?: boolean;
  /** Whether it starts checked, when uncontrolled. @default false */
  defaultChecked?: boolean;
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Shows a dash, for a partly selected group. @default false */
  indeterminate?: boolean;
  /** Marks it invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables it. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when checked. */
  value?: string;
  /** A ref to the hidden `input`. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * `Checkbox`'s props. `ref` goes to the focusable root. `className`, `style`,
 * and layout props go to the outer wrapper when there's a `label` or `hint`.
 */
export type CheckboxProps = ComponentProps<'span', CheckboxOwnProps>;

/** A checkbox, for choices submitted with a form. Use `Switch` for settings that apply immediately. */
export function Checkbox({
  label,
  hint,
  onCheckedChange,
  indeterminate = false,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  className,
  style,
  ...props
}: CheckboxProps) {
  const ownLabel = label != null;
  const field = useFieldControl(ownLabel ? 'choice' : 'native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const required = requiredProp ?? field.required;
  warnIfUnnamed('Checkbox', { label, ...props }, field.hasFieldLabel);
  const [layout, rest] = splitLayoutProps(props);

  return (
    <ChoiceLabel
      label={label}
      hint={hint}
      layout={layout}
      className={className}
      style={style}
      disabled={disabled}
      inField={field.inField}
      hintIndent="checkbox"
    >
      {(rootClass) => (
        <BaseCheckbox.Root
          className={[styles.checkbox, rootClass].filter(Boolean).join(' ')}
          style={rootClass === undefined ? undefined : style}
          indeterminate={indeterminate}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          data-invalid={invalid ? '' : undefined}
          onCheckedChange={
            onCheckedChange && ((checked) => onCheckedChange(checked))
          }
          {...rest}
        >
          <BaseCheckbox.Indicator className={styles.indicator}>
            {indeterminate ? (
              <MinusIcon aria-hidden="true" />
            ) : (
              <CheckIcon aria-hidden="true" />
            )}
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
      )}
    </ChoiceLabel>
  );
}
