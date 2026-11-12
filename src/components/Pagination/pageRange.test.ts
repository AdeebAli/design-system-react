import { pageRange } from './pageRange';

const siblings = [0, 1, 2] as const;

describe('pageRange', () => {
  it('spot-checks the start of a long range', () => {
    expect(pageRange(1, 10, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
  });

  for (const siblingCount of siblings) {
    const slots = 2 * siblingCount + 5;
    for (let total = 1; total <= 20; total++) {
      it(`holds its invariants for ${total} pages, siblingCount ${siblingCount}`, () => {
        for (let page = 1; page <= total; page++) {
          const range = pageRange(page, total, siblingCount);
          if (total <= slots) {
            expect(range).toEqual(
              Array.from({ length: total }, (_, i) => i + 1),
            );
            continue;
          }
          expect(range).toHaveLength(slots);
          expect(range[0]).toBe(1);
          expect(range.at(-1)).toBe(total);
          expect(range).toContain(page);
          // Pages ascend, and an ellipsis always hides at least two pages.
          range.forEach((item, i) => {
            if (item !== 'ellipsis') return;
            const before = range[i - 1] as number;
            const after = range[i + 1] as number;
            expect(after - before - 1).toBeGreaterThanOrEqual(2);
          });
        }
      });
    }
  }
});
