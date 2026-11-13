import { renderHook } from '@testing-library/react';
import type { Option, OptionGroup } from '../Select/options';
import { defaultComboboxLabels, useOptionSearch } from './useOptionSearch';

type Options = readonly (Option | OptionGroup)[];

const design: Option = { value: 'design', label: 'Design' };
const research: Option = { value: 'research', label: 'Research' };

it('remembers a label after options change to exclude its value', () => {
  const { result, rerender } = renderHook(
    ({ options }: { options: Options }) =>
      useOptionSearch({ component: 'Combobox', options, value: 'design' }),
    { initialProps: { options: [design, research] } },
  );
  rerender({ options: [research] });
  expect(result.current.labelFor('design')).toBe('Design');
});

it('selectedOptions gives a label for a value not in options', () => {
  const { result } = renderHook(() =>
    useOptionSearch({
      component: 'Combobox',
      options: [research],
      selectedOptions: [{ value: 'saved-1', label: 'Saved record' }],
      value: 'saved-1',
    }),
  );
  expect(result.current.labelFor('saved-1')).toBe('Saved record');
});

it('an unknown value warns once and displays the value itself', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { result, rerender } = renderHook(() =>
    useOptionSearch({
      component: 'Combobox',
      options: [research],
      value: 'mystery-value',
    }),
  );
  rerender();
  expect(result.current.labelFor('mystery-value')).toBe('mystery-value');
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]![0]).toContain('"mystery-value"');
  expect(warn.mock.calls[0]![0]).toContain('Combobox');
  warn.mockRestore();
});

it('a known value does not warn', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const onlyHere: Option = { value: 'known-only-here', label: 'Known' };
  renderHook(() =>
    useOptionSearch({
      component: 'Combobox',
      options: [onlyHere],
      value: 'known-only-here',
    }),
  );
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

it('without onSearch, filteredItems is undefined so Base UI filters', () => {
  const { result } = renderHook(() =>
    useOptionSearch({
      component: 'Combobox',
      options: [design, research],
      value: null,
    }),
  );
  expect(result.current.filteredItems).toBeUndefined();
});

it('with onSearch, filteredItems is the current options and items every option seen', () => {
  const onSearch = vi.fn();
  const { result, rerender } = renderHook(
    ({ options }: { options: Options }) =>
      useOptionSearch({
        component: 'Combobox',
        options,
        onSearch,
        value: null,
      }),
    { initialProps: { options: [design] } },
  );
  rerender({ options: [research] });
  const { filteredItems, allOptions } = result.current;
  expect(filteredItems).toEqual([{ items: [research] }]);
  expect(allOptions.map((o) => o.value)).toEqual(['design', 'research']);
});

it('keeps groups in filteredItems', () => {
  const { result } = renderHook(() =>
    useOptionSearch({
      component: 'Combobox',
      options: [{ label: 'Team', options: [design] }, research],
      onSearch: () => undefined,
      value: null,
    }),
  );
  expect(result.current.filteredItems).toEqual([
    { label: 'Team', items: [design] },
    { items: [research] },
  ]);
});

it('statusText reads loading, empty, then the count', () => {
  const { result } = renderHook(() =>
    useOptionSearch({ component: 'Combobox', options: [], value: null }),
  );
  const { statusText } = result.current;
  const labels = defaultComboboxLabels;
  expect(statusText({ loading: true, count: 3 }, labels)).toBe('Loading');
  expect(statusText({ loading: false, count: 0 }, labels)).toBe('No results');
  expect(statusText({ loading: false, count: 3 }, labels)).toBe('3 results');
});
