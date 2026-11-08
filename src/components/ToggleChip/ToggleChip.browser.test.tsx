import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { ToggleChipGroup } from '../ToggleChipGroup';
import { ToggleChip } from './index';

function token(name: string) {
  const probe = document.createElement('div');
  probe.style.background = `var(${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

it.each([
  ['sm', 28],
  ['md', 32],
] as const)('size %s is %spx tall', (size, px) => {
  render(<ToggleChip size={size}>Design</ToggleChip>);
  expect(screen.getByRole('button').getBoundingClientRect().height).toBe(px);
});

it('pressed uses the accent background', async () => {
  render(<ToggleChip>Design</ToggleChip>);
  const chip = screen.getByRole('button');
  expect(getComputedStyle(chip).backgroundColor).toBe(
    token('--ds-color-bg-muted'),
  );
  await userEvent.click(chip);
  await userEvent.unhover(chip);
  await expect
    .poll(() => getComputedStyle(chip).backgroundColor)
    .toBe(token('--ds-color-bg-accent'));
});

it('arrow keys move focus between chips in a group', async () => {
  render(
    <ToggleChipGroup aria-label="Topics">
      <ToggleChip value="a">A</ToggleChip>
      <ToggleChip value="b">B</ToggleChip>
    </ToggleChipGroup>,
  );
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'A' })).toHaveFocus();
  expect(
    getComputedStyle(screen.getByRole('button', { name: 'A' })).outlineStyle,
  ).toBe('solid');
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
});
