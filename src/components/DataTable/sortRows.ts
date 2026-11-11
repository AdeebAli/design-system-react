/**
 * Sorts rows by a value, keeping ties in their original order. `null` sorts
 * last in both directions, and numbers sort before strings in a mixed column,
 * also in both directions.
 */
export function sortRows<Row>(
  rows: readonly Row[],
  sortValue: (row: Row) => string | number | null,
  direction: 'ascending' | 'descending',
  collator: Intl.Collator,
): Row[] {
  const sign = direction === 'ascending' ? 1 : -1;
  const keyed = rows.map((row) => ({ row, value: sortValue(row) }));
  // Array.prototype.sort is stable, and the sign only flips non-ties.
  keyed.sort((a, b) => {
    if (a.value === null || b.value === null) {
      if (a.value === b.value) return 0;
      return a.value === null ? 1 : -1;
    }
    if (typeof a.value === 'number' && typeof b.value === 'number') {
      return a.value === b.value ? 0 : sign * (a.value < b.value ? -1 : 1);
    }
    // Mixed types: numbers first in both directions, like null last.
    if (typeof a.value !== typeof b.value) {
      return typeof a.value === 'number' ? -1 : 1;
    }
    return sign * collator.compare(String(a.value), String(b.value));
  });
  return keyed.map((item) => item.row);
}
