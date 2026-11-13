'use client';

import { MultiSelectButton } from './MultiSelectButton';
import { MultiSelectSearch } from './MultiSelectSearch';
import type {
  MultiSelectButtonProps,
  MultiSelectProps,
  MultiSelectSearchProps,
} from './types';

/**
 * Several choices. By default a button like `Select`'s; with `searchable`,
 * chips and a search input. The empty value is `[]`.
 */
export function MultiSelect(props: MultiSelectProps) {
  // `searchable` is taken off here, so it never reaches the DOM.
  const { searchable, ...rest } = props;
  return searchable ? (
    <MultiSelectSearch
      {...(rest as Omit<MultiSelectSearchProps, 'searchable'>)}
    />
  ) : (
    <MultiSelectButton
      {...(rest as Omit<MultiSelectButtonProps, 'searchable'>)}
    />
  );
}
