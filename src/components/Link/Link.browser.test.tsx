import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Link } from './index';

const css = () => getComputedStyle(screen.getByRole('link'));

it('shows a focus ring from the keyboard', async () => {
  render(<Link href="/x">Docs</Link>);
  expect(css().outlineStyle).toBe('none');
  await userEvent.tab();
  expect(css().outlineStyle).toBe('solid');
  expect(css().outlineWidth).toBe('2px');
});

it('neutral takes the surrounding color', () => {
  render(
    <div style={{ color: 'rgb(1, 2, 3)' }}>
      <Link href="/x" tone="neutral">
        Docs
      </Link>
    </div>,
  );
  expect(css().color).toBe('rgb(1, 2, 3)');
});

it('underlines always by default, and only on hover when asked', () => {
  render(<Link href="/x">a</Link>);
  expect(css().textDecorationLine).toBe('underline');
  render(
    <Link href="/y" underline="hover" data-testid="h">
      b
    </Link>,
  );
  expect(getComputedStyle(screen.getByTestId('h')).textDecorationLine).toBe(
    'none',
  );
});

it('inherits its font size, and the icon matches it', () => {
  render(
    <p style={{ fontSize: '30px' }}>
      <Link href="/x" external data-testid="a">
        Docs
      </Link>
    </p>,
  );
  const a = screen.getByTestId('a');
  expect(getComputedStyle(a).fontSize).toBe('30px');
  expect(getComputedStyle(a.querySelector('svg')!).width).toBe('30px');
});
