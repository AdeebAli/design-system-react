'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useState } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { box } from '../Box';
import { SearchPopup } from '../Combobox/SearchPopup';
import { useOptionSearch } from '../Combobox/useOptionSearch';
import { useFieldControl } from '../Field/FieldContext';
import { XIcon } from '../Icon/internal/X';
import * as inputStyles from '../Input/Input.css';
import { OverlayDirection } from '../overlays/direction';
import * as styles from './MultiSelect.css';
import { defaultMultiSelectLabels, type MultiSelectSearchProps } from './types';

/**
 * `MultiSelect searchable`: chips and a search input, on Base UI's
 * `Combobox` with `multiple`. The popup stays open while choosing, and the
 * filter stays until it closes.
 */
export function MultiSelectSearch({
  options,
  value,
  defaultValue,
  onValueChange,
  onSearch,
  loading = false,
  selectedOptions,
  placeholder,
  size = 'md',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  name,
  labels: labelsProp,
  className,
  style,
  ...props
}: Omit<MultiSelectSearchProps, 'searchable'>) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = field.disabled || disabledProp === true;
  const required = requiredProp ?? field.required;
  const labels = { ...defaultMultiSelectLabels, ...labelsProp };
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? []);
  const current = value ?? uncontrolled;
  // Base UI's Chips doesn't expose the open state, so the wrapper sets it.
  const [open, setOpen] = useState(false);
  const search = useOptionSearch({
    component: 'MultiSelect',
    options,
    selectedOptions,
    onSearch,
    value: current,
  });
  const [layout, rest] = splitLayoutProps(props);

  return (
    <OverlayDirection>
      <BaseCombobox.Root
        multiple
        items={search.items}
        {...(search.filteredItems && { filteredItems: search.filteredItems })}
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        onValueChange={(next: string[]) => {
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        onOpenChange={(next, details) => {
          // Base UI closes, and clears the filter, after a pick made while
          // filtering. Choosing several is the point, so stay open.
          if (!next && details.reason === 'item-press') {
            details.cancel();
            return;
          }
          setOpen(next);
        }}
        onInputValueChange={onSearch && ((query: string) => onSearch(query))}
        disabled={disabled}
        name={name}
      >
        <BaseCombobox.Chips
          className={cx(
            box(layout),
            inputStyles.control,
            inputStyles.wrapper,
            styles.chips,
            styles.minHeight[size],
            className,
          )}
          style={style}
          data-invalid={invalid ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          data-popup-open={open ? '' : undefined}
        >
          <BaseCombobox.Value>
            {(selected: string[]) =>
              selected.map((v) => {
                const label = search.labelFor(v);
                return (
                  <BaseCombobox.Chip
                    key={v}
                    className={styles.chip}
                    aria-description={labels.removeHint}
                  >
                    <span className={styles.chipLabel}>{label}</span>
                    <BaseCombobox.ChipRemove
                      className={styles.chipRemove}
                      aria-label={labels.remove.replace('{label}', () => label)}
                    >
                      <span className={styles.chipRemoveIcon}>
                        <XIcon aria-hidden="true" />
                      </span>
                    </BaseCombobox.ChipRemove>
                  </BaseCombobox.Chip>
                );
              })
            }
          </BaseCombobox.Value>
          <BaseCombobox.Input
            className={cx(inputStyles.input, styles.chipsInput)}
            placeholder={current.length === 0 ? placeholder : undefined}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-description={labels.removeHint}
            {...rest}
          />
        </BaseCombobox.Chips>
        <SearchPopup loading={loading} labels={labels} />
      </BaseCombobox.Root>
    </OverlayDirection>
  );
}
