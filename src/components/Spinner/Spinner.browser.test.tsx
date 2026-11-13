import { render, screen } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Button } from '../Button';
import { Spinner } from './index';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

const svg = (id: string) =>
  screen.getByTestId(id).querySelector('svg') as SVGElement;

it.each([
  ['sm', 14],
  ['md', 16],
  ['lg', 20],
] as const)('size %s is %spx (size.icon) wide and tall', (size, px) => {
  render(<Spinner data-testid="s" size={size} />);
  const box = svg('s').getBoundingClientRect();
  expect(box.width).toBe(px);
  expect(box.height).toBe(px);
});

it('takes the color of its surroundings', () => {
  render(
    <span style={{ color: 'rgb(200, 10, 20)' }}>
      <Spinner data-testid="s" />
    </span>,
  );
  expect(getComputedStyle(svg('s')).stroke).toBe('rgb(200, 10, 20)');
});

it('turns, and stops but stays visible under reduced motion', async () => {
  render(<Spinner data-testid="s" />);
  expect(
    parseFloat(getComputedStyle(svg('s')).animationDuration),
  ).toBeGreaterThan(0);
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  const style = getComputedStyle(svg('s'));
  expect(style.animationDuration).toBe('0s');
  expect(style.visibility).toBe('visible');
  expect(svg('s').getBoundingClientRect().width).toBe(16);
});

it("is Button's loading spinner, in the button's text color", () => {
  render(
    <Button loading data-testid="b">
      Save
    </Button>,
  );
  const button = screen.getByTestId('b');
  expect(getComputedStyle(svg('b')).stroke).toBe(
    getComputedStyle(button).color,
  );
  expect(svg('b').getBoundingClientRect().width).toBe(16);
});
