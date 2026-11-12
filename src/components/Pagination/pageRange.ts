/**
 * The items a pagination shows: page numbers and `'ellipsis'`. With
 * `slots = 2 × siblingCount + 5`, a range that fits shows every page. A longer
 * one always has exactly `slots` items, so nothing shifts while paging, and an
 * ellipsis never stands for a single page.
 */
export function pageRange(
  page: number,
  totalPages: number,
  siblingCount: 0 | 1 | 2,
): (number | 'ellipsis')[] {
  const slots = 2 * siblingCount + 5;
  const all = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  if (totalPages <= slots) return all(1, totalPages);

  const current = Math.min(Math.max(page, 1), totalPages);
  const left = current - siblingCount;
  const right = current + siblingCount;
  const edge = slots - 2;

  if (left <= 3) return [...all(1, edge), 'ellipsis', totalPages];
  if (right >= totalPages - 2) {
    return [1, 'ellipsis', ...all(totalPages - edge + 1, totalPages)];
  }
  return [1, 'ellipsis', ...all(left, right), 'ellipsis', totalPages];
}
