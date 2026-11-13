'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { CheckIcon } from '../Icon/internal/Check';
import type { Option } from '../Select/options';
import * as selectStyles from '../Select/Select.css';
import { SearchStatus } from './SearchStatus';
import type { ItemGroup, SearchLabels } from './useOptionSearch';

/**
 * The popup shared by `Combobox` and `MultiSelect searchable`: `Select`'s
 * surface and options, with the search status above the list.
 */
export function SearchPopup({
  loading,
  labels,
}: {
  loading: boolean;
  labels: Required<SearchLabels>;
}) {
  return (
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
                  <BaseCombobox.GroupLabel className={selectStyles.groupLabel}>
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
  );
}
