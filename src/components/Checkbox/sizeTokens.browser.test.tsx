import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';
import { Switch } from '../Switch';
import { ToggleChip } from '../ToggleChip';
import { Checkbox } from './index';

// A theme can resize these controls through their size tokens (Spec 09).
const bigger = {
  '--ds-size-checkbox': '1.5rem',
  '--ds-size-switch-width': '3rem',
  '--ds-size-switch-height': '1.75rem',
  '--ds-size-chip-sm': '2rem',
  '--ds-size-chip-md': '2.5rem',
} as React.CSSProperties;

it('the default sizes match Spec 09', () => {
  render(
    <>
      <Checkbox aria-label="c" />
      <RadioGroup aria-label="g">
        <Radio value="a" aria-label="r" />
      </RadioGroup>
      <Switch aria-label="s" />
      <ToggleChip size="sm">sm</ToggleChip>
      <ToggleChip size="md">md</ToggleChip>
    </>,
  );
  const box = (el: HTMLElement) => el.getBoundingClientRect();
  expect(box(screen.getByRole('checkbox')).width).toBe(18);
  expect(box(screen.getByRole('radio')).width).toBe(18);
  expect(box(screen.getByRole('switch')).width).toBe(36);
  expect(box(screen.getByRole('switch')).height).toBe(20);
  expect(box(screen.getByRole('button', { name: 'sm' })).height).toBe(28);
  expect(box(screen.getByRole('button', { name: 'md' })).height).toBe(32);
});

it('overriding the size tokens resizes every part, and the knob still fits', async () => {
  render(
    <div style={bigger}>
      <Checkbox aria-label="c" defaultChecked />
      <RadioGroup aria-label="g" defaultValue="a">
        <Radio value="a" aria-label="r" />
      </RadioGroup>
      <Switch aria-label="s" />
      <ToggleChip size="sm">sm</ToggleChip>
      <ToggleChip size="md">md</ToggleChip>
    </div>,
  );
  const box = (el: Element) => el.getBoundingClientRect();
  expect(box(screen.getByRole('checkbox')).width).toBe(24);
  expect(box(screen.getByRole('radio')).width).toBe(24);
  // The radio dot scales with the box.
  expect(box(screen.getByRole('radio').firstElementChild!).width).toBeCloseTo(
    24 * (8 / 18),
    0,
  );
  const track = screen.getByRole('switch');
  expect(box(track).width).toBe(48);
  expect(box(track).height).toBe(28);
  const thumb = track.firstElementChild!;
  // 28 − 2 × 1px border − 2 × 2px padding.
  expect(box(thumb).height).toBe(22);
  await userEvent.click(track);
  await expect
    .poll(() => box(thumb).right)
    .toBeCloseTo(box(track).right - 3, 0);
  expect(box(screen.getByRole('button', { name: 'sm' })).height).toBe(32);
  expect(box(screen.getByRole('button', { name: 'md' })).height).toBe(40);
});
