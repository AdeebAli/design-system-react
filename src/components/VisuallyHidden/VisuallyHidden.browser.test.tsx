import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './index';

it('takes no visible space, and stays out of the layout', () => {
  render(<VisuallyHidden data-testid="v">Hidden text</VisuallyHidden>);
  const el = screen.getByTestId('v');
  const { width, height } = el.getBoundingClientRect();
  expect(width).toBeLessThanOrEqual(1);
  expect(height).toBeLessThanOrEqual(1);
  expect(getComputedStyle(el).position).toBe('absolute');
  expect(getComputedStyle(el).display).not.toBe('none');
});

it('focusable stays hidden until focused, then becomes visible', () => {
  render(
    <VisuallyHidden as="a" href="#main" focusable data-testid="v">
      Skip to content
    </VisuallyHidden>,
  );
  const el = screen.getByTestId('v');
  expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  el.focus();
  expect(el.getBoundingClientRect().width).toBeGreaterThan(20);
  expect(getComputedStyle(el).clipPath).toBe('none');
  el.blur();
  expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(1);
});

it('without focusable, focus does not reveal it', () => {
  render(
    <VisuallyHidden as="a" href="#main" data-testid="v">
      Skip
    </VisuallyHidden>,
  );
  const el = screen.getByTestId('v');
  el.focus();
  expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(1);
});
