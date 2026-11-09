import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleChip } from './index';

it('toggles aria-pressed and data-pressed; onPressedChange receives a boolean', async () => {
  const onPressedChange = vi.fn();
  render(<ToggleChip onPressedChange={onPressedChange}>Archived</ToggleChip>);
  const chip = screen.getByRole('button', { name: 'Archived' });
  expect(chip).toHaveAttribute('aria-pressed', 'false');
  expect(chip).toHaveAttribute('type', 'button');
  await userEvent.click(chip);
  expect(chip).toHaveAttribute('aria-pressed', 'true');
  expect(chip).toHaveAttribute('data-pressed');
  expect(onPressedChange.mock.calls).toEqual([[true]]);
});

it('shows a check icon only when pressed', async () => {
  render(<ToggleChip>Archived</ToggleChip>);
  const chip = screen.getByRole('button');
  expect(chip.querySelector('svg')).toBeNull();
  await userEvent.click(chip);
  expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('works controlled and with defaultPressed', async () => {
  const onPressedChange = vi.fn();
  render(
    <>
      <ToggleChip pressed={false} onPressedChange={onPressedChange}>
        A
      </ToggleChip>
      <ToggleChip defaultPressed>B</ToggleChip>
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(onPressedChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

it('disabled sets data-disabled and ignores clicks', async () => {
  render(<ToggleChip disabled>A</ToggleChip>);
  const chip = screen.getByRole('button');
  await userEvent.click(chip);
  expect(chip).toHaveAttribute('aria-pressed', 'false');
  expect(chip).toHaveAttribute('data-disabled');
});
