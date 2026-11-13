'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { useId, useMemo, useState } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { box } from '../Box';
import { useFieldControl } from '../Field/FieldContext';
import { CheckIcon } from '../Icon/internal/Check';
import { ChevronDownIcon } from '../Icon/internal/ChevronDown';
import * as inputStyles from '../Input/Input.css';
import { normalizeOptions } from '../Select/options';
import * as selectStyles from '../Select/Select.css';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './MultiSelect.css';
import { defaultMultiSelectLabels, type MultiSelectButtonProps } from './types';

/**
 * The default `MultiSelect`: a button like `Select`'s, showing the first
 * label and a count. Every selected label is in a hidden element the trigger
 * references through `aria-describedby`, so truncation hides nothing.
 */
export function MultiSelectButton({
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
  labels: labelsProp,
  className,
  'aria-describedby': describedBy,
  ...props
}: Omit<MultiSelectButtonProps, 'searchable'>) {
  const field = useFieldControl('button');
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const required = requiredProp ?? field.required;
  const labels = { ...defaultMultiSelectLabels, ...labelsProp };
  const { groups, items } = useMemo(() => normalizeOptions(options), [options]);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? []);
  const current = value ?? uncontrolled;
  const labelFor = (v: string) => items[v] ?? v;
  const summaryId = useId();
  const [layout, rest] = splitLayoutProps(props);
  const describedByIds =
    [describedBy, current.length > 0 ? summaryId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <>
      <BaseSelect.Root
        multiple
        items={items}
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        onValueChange={(next: string[]) => {
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        disabled={disabled}
        name={name}
      >
        <BaseSelect.Trigger
          className={cx(
            box(layout),
            inputStyles.control,
            inputStyles.size[size],
            selectStyles.trigger,
            className,
          )}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedByIds}
          data-invalid={invalid ? '' : undefined}
          {...rest}
        >
          <BaseSelect.Value className={selectStyles.value}>
            {(selected: readonly string[]) =>
              selected.length === 0 ? (
                placeholder
              ) : (
                <span className={styles.summary}>
                  <span className={styles.first}>{labelFor(selected[0]!)}</span>
                  {selected.length > 1 && (
                    <span className={styles.count}>
                      {labels.more.replace(
                        '{count}',
                        String(selected.length - 1),
                      )}
                    </span>
                  )}
                </span>
              )
            }
          </BaseSelect.Value>
          <BaseSelect.Icon className={selectStyles.chevron}>
            <ChevronDownIcon aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            className={selectStyles.positioner}
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <BaseSelect.Popup className={selectStyles.popup}>
              <BaseSelect.List>
                {groups.map((group, index) => (
                  <BaseSelect.Group
                    key={`group-${index}`}
                    className={selectStyles.group}
                  >
                    {group.label != null && (
                      <BaseSelect.GroupLabel
                        className={selectStyles.groupLabel}
                      >
                        {group.label}
                      </BaseSelect.GroupLabel>
                    )}
                    {group.options.map((option) => (
                      <BaseSelect.Item
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        disabled={option.disabled}
                        className={selectStyles.item}
                      >
                        <BaseSelect.ItemText>
                          {option.label}
                        </BaseSelect.ItemText>
                        <BaseSelect.ItemIndicator
                          className={selectStyles.indicator}
                        >
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
      {current.length > 0 && (
        <VisuallyHidden id={summaryId}>
          {current.map(labelFor).join(', ')}
        </VisuallyHidden>
      )}
    </>
  );
}
