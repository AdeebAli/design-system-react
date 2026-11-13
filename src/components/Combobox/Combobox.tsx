'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useState } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { useFieldControl } from '../Field/FieldContext';
import { CheckIcon } from '../Icon/internal/Check';
import { ChevronDownIcon } from '../Icon/internal/ChevronDown';
import { XIcon } from '../Icon/internal/X';
import * as inputStyles from '../Input/Input.css';
import { OverlayDirection } from '../overlays/direction';
import type { Option, OptionGroup } from '../Select/options';
import * as selectStyles from '../Select/Select.css';
import type { SelectSize } from '../Select/Select';
import * as styles from './Combobox.css';
import { SearchStatus } from './SearchStatus';
import {
  defaultComboboxLabels,
  useOptionSearch,
  type ComboboxLabels,
  type ItemGroup,
  type SearchProps,
} from './useOptionSearch';

interface ComboboxOwnProps extends SearchProps {
  /** The options, as values and labels, optionally in groups. */
  options: readonly (Option | OptionGroup)[];
  /** The selected value, when controlled. `null` means nothing is selected. */
  value?: string | null;
  /** The value selected at first, when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the newly selected value, or `null` when cleared. */
  onValueChange?: (value: string | null) => void;
  /** Adds a clear button while there's a value. @default false */
  clearable?: boolean;
  /** Shown in the empty input. */
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
  /** Strings for translation. */
  labels?: ComboboxLabels;
}

/**
 * `Combobox`'s props. `ref` and native attributes go to the `input`;
 * `className`, `style`, and layout props go to its wrapper.
 */
export type ComboboxProps = ComponentProps<'input', ComboboxOwnProps>;

/**
 * A single choice, found by typing. Only listed options can be chosen. With
 * React Hook Form, use `Controller`, with `null` as the empty value.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  onSearch,
  loading = false,
  selectedOptions,
  clearable = false,
  size = 'md',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  name,
  labels: labelsProp,
  className,
  style,
  ...props
}: ComboboxProps) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = field.disabled || disabledProp === true;
  const required = requiredProp ?? field.required;
  const labels = { ...defaultComboboxLabels, ...labelsProp };
  // Tracked so a change to the same value, such as Base UI clearing an
  // already-empty selection when the text is deleted, isn't reported.
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? null);
  const current = value === undefined ? uncontrolled : value;
  const search = useOptionSearch({
    component: 'Combobox',
    options,
    selectedOptions,
    onSearch,
    value: current,
  });
  const [layout, rest] = splitLayoutProps(props);

  return (
    <OverlayDirection>
      <BaseCombobox.Root
        items={search.items}
        {...(search.filteredItems && { filteredItems: search.filteredItems })}
        itemToStringLabel={search.labelFor}
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        onValueChange={(next: string | null) => {
          if (next === current) return;
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        onInputValueChange={onSearch && ((query: string) => onSearch(query))}
        disabled={disabled}
        name={name}
      >
        <BaseCombobox.InputGroup
          className={cx(
            box(layout),
            inputStyles.control,
            inputStyles.wrapper,
            inputStyles.size[size],
            styles.group,
            className,
          )}
          style={style}
          data-invalid={invalid ? '' : undefined}
        >
          <BaseCombobox.Input
            className={inputStyles.input}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            {...rest}
          />
          {clearable && (
            <BaseCombobox.Clear
              className={styles.button}
              aria-label={labels.clear}
            >
              <span className={styles.icon}>
                <XIcon aria-hidden="true" />
              </span>
            </BaseCombobox.Clear>
          )}
          {/* Outside the Tab order and hidden from assistive tech: the input
              already opens the list with the arrow keys, and an unnamed button
              would be announced with no name. */}
          <BaseCombobox.Trigger
            className={styles.button}
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className={styles.icon}>
              <ChevronDownIcon aria-hidden="true" />
            </span>
          </BaseCombobox.Trigger>
        </BaseCombobox.InputGroup>
        <BaseCombobox.Portal>
          <BaseCombobox.Positioner
            className={selectStyles.positioner}
            sideOffset={4}
          >
            <BaseCombobox.Popup className={selectStyles.popup}>
              <SearchStatus loading={loading} labels={labels} />
              <BaseCombobox.List>
                {(group: ItemGroup, index: number) => (
                  <BaseCombobox.Group
                    key={group.label ?? `group-${index}`}
                    items={group.items}
                    className={selectStyles.group}
                  >
                    {group.label != null && (
                      <BaseCombobox.GroupLabel
                        className={selectStyles.groupLabel}
                      >
                        {group.label}
                      </BaseCombobox.GroupLabel>
                    )}
                    <BaseCombobox.Collection>
                      {(option: Option) => (
                        <BaseCombobox.Item
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          className={selectStyles.item}
                        >
                          {option.label}
                          <BaseCombobox.ItemIndicator
                            className={selectStyles.indicator}
                          >
                            <CheckIcon aria-hidden="true" />
                          </BaseCombobox.ItemIndicator>
                        </BaseCombobox.Item>
                      )}
                    </BaseCombobox.Collection>
                  </BaseCombobox.Group>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </OverlayDirection>
  );
}
