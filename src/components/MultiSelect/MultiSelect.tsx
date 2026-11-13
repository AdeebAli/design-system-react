'use client';

import { MultiSelectButton } from './MultiSelectButton';
import type { MultiSelectProps } from './types';

/**
 * Several choices. By default a button like `Select`'s; with `searchable`,
 * chips and a search input. The empty value is `[]`.
 */
export function MultiSelect(props: MultiSelectProps) {
  if (props.searchable) {
    throw new Error('MultiSelect: `searchable` is not built yet.');
  }
  // An explicit `searchable={false}` would otherwise reach the button's DOM.
  return <MultiSelectButton {...props} searchable={undefined} />;
}
