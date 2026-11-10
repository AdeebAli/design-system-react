import { normalizeOptions } from './options';

const a = { value: 'a', label: 'A' };
const b = { value: 'b', label: 'B', disabled: true };
const s = { value: 's', label: 'Standard' };
const g = { label: 'Other', options: [s] };

it('puts loose options in one unlabeled group', () => {
  expect(normalizeOptions([a, b])).toEqual({
    groups: [{ options: [a, b] }],
    items: { a: 'A', b: 'B' },
  });
});

it('keeps groups, and wraps runs of loose options in unlabeled groups, in order', () => {
  const result = normalizeOptions([a, g, b]);
  expect(result.groups).toEqual([
    { options: [a] },
    { label: 'Other', options: [s] },
    { options: [b] },
  ]);
  expect(result.items).toEqual({ a: 'A', s: 'Standard', b: 'B' });
});

it('handles an empty list', () => {
  expect(normalizeOptions([])).toEqual({ groups: [], items: {} });
});

it('items has no inherited keys, so "toString" is not a known value', () => {
  const { items } = normalizeOptions([{ value: 'a', label: 'A' }]);
  expect(Object.getPrototypeOf(items)).toBeNull();
  expect(Object.hasOwn(items, 'toString')).toBe(false);
});
