import { render, screen } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Skeleton } from './index';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

it('pulses by default', () => {
  render(<Skeleton data-testid="s" height="10" />);
  const style = getComputedStyle(screen.getByTestId('s'));
  expect(style.animationName).not.toBe('none');
  expect(parseFloat(style.animationDuration)).toBeGreaterThan(0);
});

it('reduced motion stops the pulse and keeps it visible', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  render(<Skeleton data-testid="s" height="10" />);
  const el = screen.getByTestId('s');
  const style = getComputedStyle(el);
  expect(parseFloat(style.animationDuration)).toBe(0);
  expect(style.opacity).toBe('1');
  const box = el.getBoundingClientRect();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
  expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});

it('text lines are 1em tall, following the parent font size', () => {
  render(
    <div style={{ fontSize: '30px' }}>
      <Skeleton data-testid="s" variant="text" lines={2} />
    </div>,
  );
  const [first, last] = Array.from(screen.getByTestId('s').children);
  expect(first!.getBoundingClientRect().height).toBeCloseTo(30, 0);
  const wrapper = screen.getByTestId('s').getBoundingClientRect();
  expect(last!.getBoundingClientRect().width).toBeCloseTo(
    wrapper.width * 0.6,
    0,
  );
  expect(first!.getBoundingClientRect().width).toBeCloseTo(wrapper.width, 0);
  // Gap between lines scales with the font size.
  expect(
    last!.getBoundingClientRect().top - first!.getBoundingClientRect().bottom,
  ).toBeCloseTo(15, 0);
});

it('forced colors keeps a visible border', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  render(<Skeleton data-testid="s" height="10" />);
  const style = getComputedStyle(screen.getByTestId('s'));
  expect(style.borderTopWidth).toBe('1px');
  expect(style.borderTopStyle).toBe('solid');
  // Forced colors replaces the transparent border color with a system color.
  expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
});

it('is a display block, or inline-block as a span', () => {
  render(
    <>
      <Skeleton data-testid="d" />
      <Skeleton
        data-testid="s"
        as="span"
        variant="circle"
        width="10"
        height="10"
      />
    </>,
  );
  expect(getComputedStyle(screen.getByTestId('d')).display).toBe('block');
  expect(getComputedStyle(screen.getByTestId('s')).display).toBe(
    'inline-block',
  );
});

it('defaults to full width for rect and text, but not circle', () => {
  render(
    // flex-start so a block with no width of its own shrinks to its content.
    <div
      style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Skeleton data-testid="rect" />
      <Skeleton data-testid="text" variant="text" />
      <Skeleton data-testid="circle" variant="circle" height="10" />
      <Skeleton data-testid="set" width="10" />
    </div>,
  );
  const width = (id: string) =>
    screen.getByTestId(id).getBoundingClientRect().width;
  expect(width('rect')).toBe(300);
  expect(width('text')).toBe(300);
  expect(width('circle')).not.toBe(300);
  expect(width('set')).toBe(40);
});
