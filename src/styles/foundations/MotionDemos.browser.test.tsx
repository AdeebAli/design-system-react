import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { cdp } from 'vitest/browser';
import { DurationDemo } from './MotionDemos';

async function reduceMotion(on: boolean) {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : '' }],
  });
}

afterEach(() => reduceMotion(false));

const bar = (name: string) => screen.getByTestId(`duration-${name}`);

it('Play moves the base bar over duration.base', async () => {
  render(<DurationDemo />);
  const before = getComputedStyle(bar('base')).transform;
  expect(getComputedStyle(bar('base')).transitionDuration).toBe('0.2s');
  await userEvent.click(screen.getByRole('button', { name: 'Play durations' }));
  // The transition starts at its first frame, so wait for it to move.
  await expect
    .poll(() => getComputedStyle(bar('base')).transform)
    .not.toBe(before);
});

it('under reduced motion the bars have no transition', async () => {
  render(<DurationDemo />);
  await reduceMotion(true);
  expect(getComputedStyle(bar('base')).transitionDuration).toBe('0s');
});
