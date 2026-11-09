import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { IconButton } from './index';

const icon = <Icon icon={ArrowUpIcon} data-testid="icon" />;

it('is named by aria-label and its icon is hidden', () => {
  render(<IconButton icon={icon} aria-label="Close" />);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(
    'type',
    'button',
  );
  expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
});

it('loading swaps the icon for a spinner and stays named', async () => {
  const onClick = vi.fn();
  render(
    <IconButton icon={icon} aria-label="Close" loading onClick={onClick} />,
  );
  expect(screen.queryByTestId('icon')).toBeNull();
  const b = screen.getByRole('button', { name: /Close/ });
  await userEvent.click(b);
  expect(onClick).not.toHaveBeenCalled();
  expect(b).toHaveAttribute('aria-busy', 'true');
});

it('renders a link through as', () => {
  render(<IconButton as="a" href="/x" icon={icon} aria-label="Home" />);
  expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
    'role',
  );
});

it('ref reaches the button', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<IconButton ref={ref} icon={icon} aria-label="Close" />);
  expect(ref.current).toBe(screen.getByRole('button'));
});
