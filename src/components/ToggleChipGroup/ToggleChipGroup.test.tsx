import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ToggleChip } from '../ToggleChip';
import { ToggleChipGroup } from './index';

const chip = (name: string) => screen.getByRole('button', { name });
const pressed = (name: string) =>
  chip(name).getAttribute('aria-pressed') === 'true';

function Topics(props: Partial<React.ComponentProps<typeof ToggleChipGroup>>) {
  return (
    <ToggleChipGroup aria-label="Topics" {...props}>
      <ToggleChip value="all">All</ToggleChip>
      <ToggleChip value="design">Design</ToggleChip>
      <ToggleChip value="code">Code</ToggleChip>
    </ToggleChipGroup>
  );
}

it('is a named group', () => {
  render(<Topics />);
  expect(screen.getByRole('group', { name: 'Topics' })).toBeInTheDocument();
});

it('single mode replaces the selection; onValueChange receives an array', async () => {
  const onValueChange = vi.fn();
  render(<Topics defaultValue={['all']} onValueChange={onValueChange} />);
  await userEvent.click(chip('Design'));
  expect(pressed('Design')).toBe(true);
  expect(pressed('All')).toBe(false);
  expect(onValueChange.mock.calls).toEqual([[['design']]]);
});

it('multiple accumulates', async () => {
  render(<Topics multiple />);
  await userEvent.click(chip('Design'));
  await userEvent.click(chip('Code'));
  expect(pressed('Design') && pressed('Code')).toBe(true);
});

it('pressing the selected chip clears it', async () => {
  render(<Topics defaultValue={['all']} />);
  await userEvent.click(chip('All'));
  expect(pressed('All')).toBe(false);
});

it('a controlled group that ignores empty changes keeps one selected', async () => {
  function AlwaysOne() {
    const [value, setValue] = useState(['all']);
    return (
      <Topics
        value={value}
        onValueChange={(next) => next.length > 0 && setValue(next)}
      />
    );
  }
  render(<AlwaysOne />);
  await userEvent.click(chip('All'));
  expect(pressed('All')).toBe(true);
  await userEvent.click(chip('Code'));
  expect(pressed('Code')).toBe(true);
  expect(pressed('All')).toBe(false);
});

it('disabled disables every chip', () => {
  render(<Topics disabled />);
  expect(chip('All')).toHaveAttribute('data-disabled');
});
