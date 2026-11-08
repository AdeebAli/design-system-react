import { render, screen } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Card } from '../Card';
import { Button } from './index';

async function reduceMotion(on: boolean) {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : '' }],
  });
}

afterEach(() => reduceMotion(false));

it('the loading spinner turns, and stops but stays visible under reduced motion', async () => {
  render(
    <Button loading data-testid="b">
      Save
    </Button>,
  );
  const spinner = () =>
    screen.getByTestId('b').querySelector('svg') as SVGElement;
  expect(
    parseFloat(getComputedStyle(spinner()).animationDuration),
  ).toBeGreaterThan(0);
  await reduceMotion(true);
  expect(getComputedStyle(spinner()).animationDuration).toBe('0s');
  const box = spinner().getBoundingClientRect();
  expect(box.width).toBeGreaterThan(0);
  expect(getComputedStyle(spinner()).visibility).toBe('visible');
});

it('an interactive card has no transition under reduced motion', async () => {
  render(<Card as="a" href="#x" interactive data-testid="c" />);
  const duration = () =>
    getComputedStyle(screen.getByTestId('c')).transitionDuration;
  expect(duration()).not.toBe('0s');
  await reduceMotion(true);
  expect(duration()).toBe('0s');
});
