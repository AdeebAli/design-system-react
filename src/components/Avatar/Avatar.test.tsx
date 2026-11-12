import { render, screen } from '@testing-library/react';
import { Icon } from '../Icon';
import { InfoIcon } from '../Icon/internal/Info';
import { Avatar } from './index';
import * as styles from './Avatar.css';

it('is an image named by name, with hidden contents', () => {
  render(<Avatar data-testid="a" name="Ada Park" />);
  const root = screen.getByTestId('a');
  expect(root).toHaveAttribute('role', 'img');
  expect(root).toHaveAttribute('aria-label', 'Ada Park');
  expect(root).not.toHaveAttribute('aria-hidden');
  expect(root.children.length).toBeGreaterThan(0);
  for (const child of root.children) {
    expect(child).toHaveAttribute('aria-hidden', 'true');
  }
});

it('hides the status dot too', () => {
  render(<Avatar data-testid="a" name="Ada Park" status="online" />);
  const children = [...screen.getByTestId('a').children];
  expect(children).toHaveLength(2);
  for (const child of children) {
    expect(child).toHaveAttribute('aria-hidden', 'true');
  }
});

it('adds the status to the name', () => {
  render(<Avatar name="Ada Park" status="online" />);
  expect(screen.getByRole('img')).toHaveAttribute(
    'aria-label',
    'Ada Park, online',
  );
});

it('statusLabels translate the status', () => {
  render(
    <Avatar name="Ada Park" status="busy" statusLabels={{ busy: 'ocupada' }} />,
  );
  expect(screen.getByRole('img')).toHaveAttribute(
    'aria-label',
    'Ada Park, ocupada',
  );
});

it.each(['online', 'away', 'busy', 'offline'] as const)(
  'labels %s in English by default',
  (status) => {
    render(<Avatar name="Ada" status={status} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      `Ada, ${status}`,
    );
  },
);

it('decorative hides the root instead of naming it', () => {
  render(<Avatar data-testid="a" name="Ada Park" status="away" decorative />);
  const root = screen.getByTestId('a');
  expect(root).toHaveAttribute('aria-hidden', 'true');
  expect(root).not.toHaveAttribute('role');
  expect(root).not.toHaveAttribute('aria-label');
});

it.each(['circle', 'square'] as const)('sets data-shape=%s', (shape) => {
  render(<Avatar data-testid="a" name="Ada" shape={shape} />);
  expect(screen.getByTestId('a')).toHaveAttribute('data-shape', shape);
});

it('defaults to a circle', () => {
  render(<Avatar data-testid="a" name="Ada" />);
  expect(screen.getByTestId('a')).toHaveAttribute('data-shape', 'circle');
});

it('shows initials without an image', () => {
  render(<Avatar data-testid="a" name="Ada Park" />);
  expect(screen.getByTestId('a')).toHaveTextContent('AP');
});

it('fallback replaces the initials', () => {
  render(
    <Avatar
      data-testid="a"
      name="Ada Park"
      fallback={<Icon icon={InfoIcon} data-testid="icon" />}
    />,
  );
  expect(screen.getByTestId('a')).not.toHaveTextContent('AP');
  expect(screen.getByTestId('icon')).toBeInTheDocument();
});

it('renders the image with src, and keeps the initials behind it', () => {
  render(<Avatar data-testid="a" name="Ada Park" src="/ada.jpg" />);
  const image = screen.getByTestId('a').querySelector('img');
  expect(image).toHaveAttribute('src', '/ada.jpg');
  expect(image).toHaveAttribute('alt', '');
  expect(screen.getByTestId('a')).toHaveTextContent('AP');
});

it('colorFromName colors the fallback from the name', () => {
  render(<Avatar data-testid="a" name="Ada Park" colorFromName />);
  // 'Ada Park' hashes to pair 4.
  expect(screen.getByText('AP')).toHaveClass(styles.color[4]);
});

it('has no name color without colorFromName', () => {
  render(<Avatar name="Ada Park" />);
  const fallback = screen.getByText('AP');
  for (const n of [1, 2, 3, 4, 5, 6] as const) {
    expect(fallback).not.toHaveClass(styles.color[n]);
  }
});

it('a blank name renders no initials and does not throw', () => {
  render(<Avatar data-testid="a" name="   " />);
  expect(screen.getByTestId('a').textContent).toBe('');
});

it('forwards ref and className to the root', () => {
  let node: HTMLElement | null = null;
  render(
    <Avatar
      data-testid="a"
      name="Ada"
      className="mine"
      ref={(element) => {
        node = element;
      }}
    />,
  );
  expect(node).toBe(screen.getByTestId('a'));
  expect(screen.getByTestId('a')).toHaveClass('mine');
});
