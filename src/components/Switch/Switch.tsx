'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ReactNode, Ref } from 'react';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import * as styles from '../Checkbox/choice.css';
import { ChoiceLabel } from '../Checkbox/ChoiceLabel';
import { warnIfUnnamed } from '../Checkbox/useChoiceName';
import { useFieldControl } from '../Field/FieldContext';

interface SwitchOwnProps {
  /** The switch's label. The whole label is clickable. */
  label?: ReactNode;
  /** Help text below the label. */
  hint?: ReactNode;
  /** Whether it's on, when controlled. */
  checked?: boolean;
  /** Whether it starts on, when uncontrolled. @default false */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Marks it invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables it. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when on. */
  value?: string;
  /** A ref to the hidden `input`. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * `Switch`'s props. `ref` goes to the focusable root. `className`, `style`,
 * and layout props go to the outer wrapper when there's a `label` or `hint`.
 */
export type SwitchProps = ComponentProps<'span', SwitchOwnProps>;

/** A switch, for a setting that applies immediately. Use `Checkbox` in forms. */
export function Switch({
  label,
  hint,
  onCheckedChange,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  className,
  style,
  ...props
}: SwitchProps) {
  const field = useFieldControl(label != null ? 'choice' : 'button');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const required = requiredProp ?? field.required;
  warnIfUnnamed('Switch', { label, ...props }, field.hasFieldLabel);
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
      hintIndent="switch"
    >
      {(rootClass) => (
        <BaseSwitch.Root
          className={[styles.track, rootClass].filter(Boolean).join(' ')}
          style={rootClass === undefined ? undefined : style}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          data-invalid={invalid ? '' : undefined}
          onCheckedChange={
            onCheckedChange && ((checked) => onCheckedChange(checked))
          }
          {...rest}
        >
          <BaseSwitch.Thumb className={styles.thumb} />
        </BaseSwitch.Root>
      )}
    </ChoiceLabel>
  );
}
