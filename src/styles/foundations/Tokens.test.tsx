import { render, screen, within } from '@testing-library/react';
import { softShared } from '../../themes/softShared';
import { tokens } from '../../tokens/primitives';
import {
  AvatarColorTable,
  ColorTable,
  FontFamilies,
  LetterSpacings,
  LineHeights,
  PrimitiveRamps,
  PrimitiveScales,
} from './Tokens';

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

it('lists the three font families with their stacks and license', () => {
  render(<FontFamilies />);
  const rows = screen.getAllByRole('row').slice(1);
  expect(rows).toHaveLength(3);
  (['sans', 'mono', 'prose'] as const).forEach((family, index) => {
    const row = rows[index]!;
    expect(within(row).getByText(softShared.font.family[family])).toBeTruthy();
    expect(within(row).getByText(`font.family.${family}`)).toBeTruthy();
    expect(within(row).getByText(/SIL Open Font License/)).toBeTruthy();
  });
});

it.each([
  ['LineHeights', LineHeights, softShared.font.lineHeight],
  ['LetterSpacings', LetterSpacings, softShared.font.letterSpacing],
] as const)('%s has one row per token', (_, Component, values) => {
  render(<Component />);
  const rows = screen.getAllByRole('row').slice(1);
  expect(rows.map((row) => row.querySelector('code')?.textContent)).toEqual(
    Object.keys(values),
  );
});

it('shows one swatch per step of every palette ramp', () => {
  const { container } = render(<PrimitiveRamps />);
  const steps = [
    ...Object.values(tokens.neutral),
    ...Object.values(tokens.indigo),
    ...Object.values(tokens.status).flatMap((ramp) => Object.values(ramp)),
  ];
  const swatches = [...container.querySelectorAll('[data-swatch]')].map(
    (swatch) => swatch.getAttribute('data-swatch'),
  );
  expect(swatches).toEqual(steps);
});

it('lists the raw font sizes and spacing scale', () => {
  render(<PrimitiveScales />);
  for (const name of Object.keys(tokens.fontSize)) {
    expect(screen.getByText(`fontSize.${name}`)).toBeTruthy();
  }
  for (const name of Object.keys(tokens.space)) {
    expect(screen.getByText(`space.${name}`)).toBeTruthy();
  }
});
