'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useEffect, useMemo, useState } from 'react';
import { warnOnce } from '../../utils/warn';
import {
  normalizeOptions,
  type Option,
  type OptionGroup,
} from '../Select/options';

/** Props shared by `Combobox` and `MultiSelect searchable`. */
export interface SearchProps {
  /**
   * Called with the typed text. It turns off local filtering, so the project
   * supplies matching `options`, and owns debouncing and stale responses.
   */
  onSearch?: (query: string) => void;
  /** Shows and announces `labels.loading` in the popup. @default false */
  loading?: boolean;
  /** Labels for starting values that aren't in `options`, such as a saved record's. @default [] */
  selectedOptions?: Option[];
}

/** The search status strings. */
export interface SearchLabels {
  /** Shown and announced while `loading`. @default 'Loading' */
  loading?: string;
  /** Shown and announced when nothing matches. @default 'No results' */
  empty?: string;
  /** Announced with the match count, where `{count}` is the number. @default '{count} results' */
  results?: string;
}

/** Strings for translation. */
export interface ComboboxLabels extends SearchLabels {
  /** The clear button's name. @default 'Clear' */
  clear?: string;
}

export const defaultComboboxLabels: Required<ComboboxLabels> = {
  clear: 'Clear',
  loading: 'Loading',
  empty: 'No results',
  results: '{count} results',
};

/** A group in Base UI's grouped `items` shape. */
export interface ItemGroup {
  // Base UI's group type has an index signature.
  [key: string]: unknown;
  label?: string;
  items: Option[];
}

const toItemGroups = (options: readonly (Option | OptionGroup)[]) =>
  normalizeOptions(options).groups.map((group): ItemGroup =>
    group.label == null
      ? { items: group.options }
      : { label: group.label, items: group.options },
  );

const collection = (groups: ItemGroup[]) =>
  BaseCombobox.createItems(groups, {
    getValue: (option: Option) => option.value,
    getLabel: (option: Option) => option.label,
  });

export function statusText(
  { loading, count }: { loading: boolean; count: number },
  labels: Required<SearchLabels>,
): string {
  if (loading) return labels.loading;
  if (count === 0) return labels.empty;
  return labels.results.replace('{count}', String(count));
}

interface UseOptionSearchArgs {
  /** Named in development warnings. */
  component: 'Combobox' | 'MultiSelect';
  options: readonly (Option | OptionGroup)[];
  selectedOptions?: readonly Option[];
  onSearch?: (query: string) => void;
  /** The selected value or values, checked for a known label. */
  value: string | readonly string[] | null | undefined;
}

/**
 * The search state shared by `Combobox` and `MultiSelect searchable`: the
 * items for Base UI, and the label of every option seen so far, so a selected
 * value still displays after `options` changes.
 */
export function useOptionSearch({
  component,
  options,
  selectedOptions,
  onSearch,
  value,
}: UseOptionSearchArgs) {
  // Every option seen, by value. A state object that's only ever added to,
  // so it outlives `options` without causing renders.
  const [seen] = useState(() => new Map<string, Option>());
  const groups = useMemo(() => toItemGroups(options), [options]);

  const allOptions = useMemo(() => {
    for (const option of selectedOptions ?? []) {
      if (!seen.has(option.value)) seen.set(option.value, option);
    }
    for (const group of groups) {
      for (const option of group.items) seen.set(option.value, option);
    }
    return [...seen.values()];
  }, [groups, selectedOptions, seen]);

  const searching = onSearch != null;
  const items = useMemo(
    () => collection(searching ? [{ items: allOptions }] : groups),
    [searching, allOptions, groups],
  );

  const labelFor = (v: string) => seen.get(v)?.label ?? v;

  const values =
    value == null ? [] : typeof value === 'string' ? [value] : value;
  const unknown = values.filter((v) => !seen.has(v));
  const unknownKey = unknown.join('\u0000');
  useEffect(() => {
    for (const v of unknownKey ? unknownKey.split('\u0000') : []) {
      warnOnce(
        `option-search-unknown-${v}`,
        `${component}: the value ${JSON.stringify(v)} isn't in \`options\` or \`selectedOptions\`, so its label is unknown and the value is shown instead. Add it to \`selectedOptions\`.`,
      );
    }
  }, [unknownKey, component]);

  return {
    items,
    filteredItems: searching ? groups : undefined,
    allOptions,
    labelFor,
    statusText,
  };
}
