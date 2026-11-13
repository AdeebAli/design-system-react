'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { Option } from '../Select/options';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Combobox.css';
import {
  statusText,
  type ItemGroup,
  type SearchLabels,
} from './useOptionSearch';

const countItems = (filtered: readonly (ItemGroup | Option)[]) =>
  filtered.reduce(
    (count, entry) => count + ('items' in entry ? entry.items.length : 1),
    0,
  );

/**
 * Base UI's status element, mounted for as long as the popup is, so only its
 * text changes and each change is announced. Loading and empty are shown; the
 * result count is only announced.
 */
export function SearchStatus({
  loading,
  labels,
}: {
  loading: boolean;
  labels: Required<SearchLabels>;
}) {
  const count = countItems(BaseCombobox.useFilteredItems<ItemGroup | Option>());
  const text = statusText({ loading, count }, labels);
  return (
    <BaseCombobox.Status>
      {loading || count === 0 ? (
        <span className={styles.status}>{text}</span>
      ) : (
        <VisuallyHidden>{text}</VisuallyHidden>
      )}
    </BaseCombobox.Status>
  );
}
