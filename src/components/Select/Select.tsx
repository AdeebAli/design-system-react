'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { useMemo } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { useFieldControl } from '../Field/FieldContext';
import { CheckIcon } from '../Icon/internal/Check';
import { ChevronDownIcon } from '../Icon/internal/ChevronDown';
import * as inputStyles from '../Input/Input.css';
import { normalizeOptions, type Option, type OptionGroup } from './options';
import * as styles from './Select.css';

/** Select heights: 28, 36, and 44px. */
export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOwnProps {
  /** The options, as values and labels, optionally in groups. */
  options: readonly (Option | OptionGroup)[];
  /** The selected value, when controlled. `null` means nothing is selected. */
  value?: string | null;
  /** The value selected at first, when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the newly selected value. */
  onValueChange?: (value: string | null) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** The height. @default 'md' */
  size?: SelectSize;
  /** Marks it invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables it. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The name the value is submitted under in a form. */
  name?: string;
}

/**
 * `Select`'s props. `ref`, `className`, `style`, and layout props go to the
 * trigger, the control that takes focus.
 */
export type SelectProps = ComponentProps<'button', SelectOwnProps>;

/** A single-choice dropdown. With React Hook Form, use `Controller`, with `null` as the empty value. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  name,
  className,
  ...props
}: SelectProps) {
  const field = useFieldControl('button');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const required = requiredProp ?? field.required;
  const { groups, items } = useMemo(() => normalizeOptions(options), [options]);
  const [layout, rest] = splitLayoutProps(props);
  // Base UI treats an unknown value as selected; show the placeholder instead.
  const known = (v: string | null | undefined) =>
    v == null || v in items ? v : null;

  return (
    <BaseSelect.Root
      items={items}
      {...(value !== undefined && { value: known(value) })}
      {...(defaultValue !== undefined && { defaultValue: known(defaultValue) })}
      onValueChange={
        onValueChange && ((next: string | null) => onValueChange(next))
      }
      disabled={disabled}
      name={name}
    >
      <BaseSelect.Trigger
        className={cx(
          box(layout),
          inputStyles.control,
          inputStyles.size[size],
          styles.trigger,
          className,
        )}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        data-invalid={invalid ? '' : undefined}
        {...rest}
      >
        <BaseSelect.Value className={styles.value} placeholder={placeholder} />
        <BaseSelect.Icon className={styles.chevron}>
          <ChevronDownIcon aria-hidden="true" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          className={styles.positioner}
          sideOffset={4}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup className={styles.popup}>
            <BaseSelect.List>
              {groups.map((group, index) => (
                <BaseSelect.Group
                  key={group.label ?? `loose-${index}`}
                  className={styles.group}
                >
                  {group.label != null && (
                    <BaseSelect.GroupLabel className={styles.groupLabel}>
                      {group.label}
                    </BaseSelect.GroupLabel>
                  )}
                  {group.options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      className={styles.item}
                    >
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                      <BaseSelect.ItemIndicator className={styles.indicator}>
                        <CheckIcon aria-hidden="true" />
                      </BaseSelect.ItemIndicator>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.Group>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
