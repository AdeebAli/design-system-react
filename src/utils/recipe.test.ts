import { layered } from './recipe';

it('wraps base, nested, and media styles in the components layer', () => {
  const rule = layered({
    padding: 0,
    selectors: { '&:hover': { color: 'red' } },
    '@media': { '(min-width: 1px)': { margin: 0 } },
  });
  expect(Object.keys(rule)).toEqual(['@layer']);
  const inner = rule['@layer']?.['ds.components'];
  expect(inner).toHaveProperty('padding', 0);
  expect(inner).toHaveProperty('selectors');
  expect(inner).toHaveProperty('@media');
});
