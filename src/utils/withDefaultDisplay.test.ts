import { withDefaultDisplay } from './withDefaultDisplay';

it('uses the fallback when unset', () => {
  expect(withDefaultDisplay(undefined, 'flex')).toBe('flex');
});

it('keeps a plain value', () => {
  expect(withDefaultDisplay('none', 'flex')).toBe('none');
});

it('fills in a missing base', () => {
  expect(withDefaultDisplay({ md: 'none' }, 'flex')).toEqual({
    base: 'flex',
    md: 'none',
  });
});

it('fills in an undefined base', () => {
  expect(withDefaultDisplay({ base: undefined, md: 'none' }, 'flex')).toEqual({
    base: 'flex',
    md: 'none',
  });
});

it('keeps an explicit base', () => {
  expect(withDefaultDisplay({ base: 'none', md: 'flex' }, 'flex')).toEqual({
    base: 'none',
    md: 'flex',
  });
});
