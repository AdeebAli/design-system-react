import { render, screen } from '@testing-library/react';
import { Inset } from './index';

const css = () => getComputedStyle(screen.getByTestId('i'));

it('applies padding per side', () => {
  render(<Inset data-testid="i" top="1" bottom="2" start="3" end="4" />);
  expect(css().paddingTop).toBe('4px');
  expect(css().paddingBottom).toBe('8px');
  expect(css().paddingInlineStart).toBe('12px');
  expect(css().paddingInlineEnd).toBe('16px');
});

it('a side beats an axis, which beats space', () => {
  render(<Inset data-testid="i" space="1" x="2" start="3" />);
  expect(css().paddingTop).toBe('4px');
  expect(css().paddingInlineEnd).toBe('8px');
  expect(css().paddingInlineStart).toBe('12px');
});
