import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { ToggleChip } from '../ToggleChip';
import { ToggleChipGroup } from './index';

const chip = (name: string) => screen.getByRole('button', { name });

function Filters() {
  return (
    <ToggleChipGroup aria-label="Filters">
      <ToggleChip value="open">Open</ToggleChip>
      <ToggleChip value="closed">Closed</ToggleChip>
      <ToggleChip value="draft">Draft</ToggleChip>
    </ToggleChipGroup>
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('dir');
});

it('ArrowLeft moves focus to the next chip in RTL', async () => {
  const { unmount } = render(<Filters />);
  chip('Open').focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(chip('Closed')).toHaveFocus();
  unmount();

  document.documentElement.dir = 'rtl';
  render(<Filters />);
  chip('Open').focus();
  await userEvent.keyboard('{ArrowLeft}');
  expect(chip('Closed')).toHaveFocus();
});
