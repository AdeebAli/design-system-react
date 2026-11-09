import { render, screen } from '@testing-library/react';
import { Stat } from './index';

it('uppercases the label in CSS and uses tabular numerals', () => {
  render(<Stat label="Revenue" value="$21.4k" />);
  expect(getComputedStyle(screen.getByRole('term')).textTransform).toBe(
    'uppercase',
  );
  expect(
    getComputedStyle(screen.getByRole('definition')).fontVariantNumeric,
  ).toBe('tabular-nums');
});

it.each([
  ['sm', 22],
  ['md', 28],
  ['lg', 36],
] as const)('size %s gives a %spx value', (size, px) => {
  render(<Stat label="L" value="1" size={size} />);
  expect(getComputedStyle(screen.getByRole('definition')).fontSize).toBe(
    `${px}px`,
  );
});
