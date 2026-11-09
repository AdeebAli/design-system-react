import { spanToGrid } from './span';

it('maps fixed spans, collapsing wide cards below md', () => {
  expect(spanToGrid(undefined)).toEqual({});
  expect(spanToGrid('1x1')).toEqual({});
  expect(spanToGrid('2x1')).toEqual({
    gridColumn: { base: 'full', md: 'span-2' },
  });
  expect(spanToGrid('1x2')).toEqual({ gridRow: 'span-2' });
  expect(spanToGrid('2x2')).toEqual({
    gridColumn: { base: 'full', md: 'span-2' },
    gridRow: 'span-2',
  });
  expect(spanToGrid('3x1')).toEqual({
    gridColumn: { base: 'full', md: 'span-3' },
  });
  expect(spanToGrid('4x1')).toEqual({
    gridColumn: { base: 'full', md: 'span-4' },
  });
  expect(spanToGrid('full')).toEqual({ gridColumn: 'full' });
});

it('takes a responsive span literally', () => {
  expect(spanToGrid({ base: '1x1', md: '2x1' })).toEqual({
    gridColumn: { base: 'span-1', md: 'span-2' },
    gridRow: { base: 'span-1', md: 'span-1' },
  });
  expect(spanToGrid({ lg: 'full' })).toEqual({
    gridColumn: { lg: 'full' },
    gridRow: {},
  });
});
