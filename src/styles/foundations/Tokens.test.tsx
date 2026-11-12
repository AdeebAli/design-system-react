import { render, screen, within } from '@testing-library/react';
import { AvatarColorTable, ColorTable } from './Tokens';

it.each([
  ['bg', 'canvas', 'color.fg.default'],
  ['fg', 'default', 'color.bg.surface'],
] as const)('lists the flat %s tokens only', (group, first, against) => {
  render(<ColorTable group={group} against={against} />);
  expect(screen.getByText(`color.${group}.${first}`)).toBeTruthy();
  expect(screen.queryByText(`color.${group}.avatar`)).toBeNull();
});

it('lists the six avatar pairs with their contrast in both modes', () => {
  render(<AvatarColorTable />);
  const rows = screen.getAllByRole('row').slice(1);
  expect(rows).toHaveLength(6);
  // Pair 1: #1e40af on #dbeafe in Soft Light, #93c5fd on #1e2a4a in Soft Dark.
  expect(within(rows[0]!).getByText('7.15:1')).toBeTruthy();
  expect(within(rows[0]!).getByText('7.84:1')).toBeTruthy();
});
