import { render, screen } from '@testing-library/react';
import { Spinner } from './index';
import * as styles from './Spinner.css';

it('is a span hidden from screen readers without a label', () => {
  render(<Spinner data-testid="s" />);
  const root = screen.getByTestId('s');
  expect(root.tagName).toBe('SPAN');
  expect(root).toHaveAttribute('aria-hidden', 'true');
  expect(root).not.toHaveAttribute('role');
});

it('is a status with its label as text when labeled', () => {
  render(<Spinner label="Loading results" />);
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Loading results');
});

it('draws with currentColor', () => {
  render(<Spinner data-testid="s" />);
  const svg = screen.getByTestId('s').querySelector('svg');
  expect(svg).toHaveAttribute('stroke', 'currentColor');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
});

it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
  render(<Spinner data-testid="s" size={size} />);
  expect(screen.getByTestId('s').querySelector('svg')).toHaveClass(
    styles.size[size],
  );
});

it('defaults to md', () => {
  render(<Spinner data-testid="s" />);
  expect(screen.getByTestId('s').querySelector('svg')).toHaveClass(
    styles.size.md,
  );
});
