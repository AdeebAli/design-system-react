import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import { EmptyState } from './index';

it('renders the title as an h3 by default', () => {
  render(<EmptyState title="No results" />);
  expect(
    screen.getByRole('heading', { level: 3, name: 'No results' }),
  ).toBeInTheDocument();
});

it('headingLevel changes the tag, not the size class', () => {
  const { unmount } = render(<EmptyState title="A" />);
  const before = screen.getByRole('heading').className;
  unmount();
  render(<EmptyState title="A" headingLevel={5} />);
  const heading = screen.getByRole('heading', { level: 5 });
  expect(heading.tagName).toBe('H5');
  expect(heading.className).toBe(before);
});

it('size changes the heading size and the padding', () => {
  const { unmount } = render(<EmptyState data-testid="e" title="A" />);
  const md = [
    screen.getByTestId('e').className,
    screen.getByRole('heading').className,
  ];
  unmount();
  render(<EmptyState data-testid="e" title="A" size="sm" />);
  expect(screen.getByTestId('e').className).not.toBe(md[0]);
  expect(screen.getByRole('heading').className).not.toBe(md[1]);
});

it('renders the description, icon, and action', () => {
  render(
    <EmptyState
      title="No results"
      description="Try a different search."
      icon={<svg data-testid="icon" />}
      action={<Button>Clear filters</Button>}
    />,
  );
  expect(screen.getByText('Try a different search.')).toBeInTheDocument();
  expect(screen.getByTestId('icon')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Clear filters' }),
  ).toBeInTheDocument();
});

it('renders only the title when nothing else is passed', () => {
  render(<EmptyState data-testid="e" title="Nothing" />);
  expect(screen.getByTestId('e').children).toHaveLength(1);
});

it('applies layout props', () => {
  const { unmount } = render(<EmptyState data-testid="e" title="A" />);
  const plain = screen.getByTestId('e').className;
  unmount();
  render(<EmptyState data-testid="e" title="A" marginTop="4" width="1/2" />);
  expect(screen.getByTestId('e').className).not.toBe(plain);
});
