import { expect, it } from 'vitest';
import { sortRows } from './sortRows';

const en = new Intl.Collator('en-US');
const id = (row: { v: string | number | null }) => row.v;

it('keeps ties in their original order, in both directions', () => {
  const rows = [
    { v: 1, n: 'a' },
    { v: 1, n: 'b' },
    { v: 0, n: 'c' },
    { v: 1, n: 'd' },
  ];
  expect(sortRows(rows, id, 'ascending', en).map((r) => r.n)).toEqual([
    'c',
    'a',
    'b',
    'd',
  ]);
  expect(sortRows(rows, id, 'descending', en).map((r) => r.n)).toEqual([
    'a',
    'b',
    'd',
    'c',
  ]);
});

it('puts null last ascending and descending', () => {
  const rows = [{ v: 2 }, { v: null }, { v: 1 }];
  expect(sortRows(rows, id, 'ascending', en).map((r) => r.v)).toEqual([
    1,
    2,
    null,
  ]);
  expect(sortRows(rows, id, 'descending', en).map((r) => r.v)).toEqual([
    2,
    1,
    null,
  ]);
});

it('sorts strings with the collator, so the locale decides where ä goes', () => {
  const rows = [{ v: 'ä' }, { v: 'z' }, { v: 'a' }];
  const order = (locale: string) =>
    sortRows(rows, id, 'ascending', new Intl.Collator(locale)).map((r) => r.v);
  expect(order('sv-SE')).toEqual(['a', 'z', 'ä']);
  expect(order('en-US')).toEqual(['a', 'ä', 'z']);
});

it('does not change the input', () => {
  const rows = [{ v: 2 }, { v: 1 }];
  sortRows(rows, id, 'ascending', en);
  expect(rows.map((r) => r.v)).toEqual([2, 1]);
});

it('puts numbers before strings in both directions, flipping only within a type', () => {
  const rows = [{ v: 'b' }, { v: 2 }, { v: 'a' }, { v: 1 }, { v: null }];
  expect(sortRows(rows, id, 'ascending', en).map((r) => r.v)).toEqual([
    1,
    2,
    'a',
    'b',
    null,
  ]);
  expect(sortRows(rows, id, 'descending', en).map((r) => r.v)).toEqual([
    2,
    1,
    'b',
    'a',
    null,
  ]);
});

it('orders infinities consistently', () => {
  const rows = [{ v: Infinity }, { v: Infinity }, { v: -Infinity }, { v: 0 }];
  expect(sortRows(rows, id, 'ascending', en).map((r) => r.v)).toEqual([
    -Infinity,
    0,
    Infinity,
    Infinity,
  ]);
});

it('treats NaN like null: last in both directions', () => {
  const rows = [{ v: NaN }, { v: 2 }, { v: null }, { v: 1 }, { v: NaN }];
  const sorted = (direction: 'ascending' | 'descending') =>
    sortRows(rows, id, direction, en).map((r) => r.v);
  expect(sorted('ascending').slice(0, 2)).toEqual([1, 2]);
  expect(sorted('descending').slice(0, 2)).toEqual([2, 1]);
  // Ties among the empty values keep their original order.
  expect(sorted('ascending').slice(2)).toEqual([NaN, null, NaN]);
  expect(sorted('descending').slice(2)).toEqual([NaN, null, NaN]);
});
