import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { Button } from './index';

const warnSpy = () =>
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

it('defaults to type="button"', () => {
  render(<Button>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
    'type',
    'button',
  );
});

it('respects type="submit"', () => {
  render(<Button type="submit">Save</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
});

it('fires onClick', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it.each([
  ['soft', 'danger', 'neutral'],
  ['solid', 'neutral', 'accent'],
  ['outline', 'accent', 'neutral'],
] as const)('%s + %s warns and uses %s', (variant, tone, fallback) => {
  const warn = warnSpy();
  render(
    <>
      <Button data-testid="bad" variant={variant} tone={tone}>
        x
      </Button>
      <Button data-testid="good" variant={variant} tone={fallback}>
        x
      </Button>
    </>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/Button.*tone/);
  expect(screen.getByTestId('bad').className).toBe(
    screen.getByTestId('good').className,
  );
  warn.mockRestore();
});

it.each([
  ['solid', 'accent'],
  ['solid', 'danger'],
  ['soft', 'neutral'],
  ['outline', 'neutral'],
  ['ghost', 'neutral'],
  ['ghost', 'danger'],
] as const)('%s + %s is valid', (variant, tone) => {
  const warn = warnSpy();
  render(
    <Button variant={variant} tone={tone}>
      x
    </Button>,
  );
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

it('loading ignores clicks, sets aria-busy and data-loading, keeps focus, and adds hidden "Loading"', async () => {
  const onClick = vi.fn();
  render(
    <Button loading onClick={onClick}>
      Save
    </Button>,
  );
  const b = screen.getByRole('button', { name: /Save/ });
  b.focus();
  await userEvent.click(b);
  expect(onClick).not.toHaveBeenCalled();
  expect(b).toHaveFocus();
  expect(b).toHaveAttribute('aria-busy', 'true');
  expect(b).toHaveAttribute('data-loading');
  expect(b).not.toBeDisabled();
  expect(b).toHaveTextContent('Loading');
});

it('loadingLabel replaces the hidden text', () => {
  render(
    <Button loading loadingLabel="Saving">
      Save
    </Button>,
  );
  expect(screen.getByRole('button')).toHaveTextContent('Saving');
});

it('loading prevents submitting its form by click', async () => {
  const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit" loading>
        Go
      </Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(onSubmit).not.toHaveBeenCalled();
});

it('loading prevents implicit submission from Enter in an input', async () => {
  const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <input aria-label="q" />
      <Button type="submit" loading>
        Go
      </Button>
    </form>,
  );
  await userEvent.type(screen.getByLabelText('q'), 'x{Enter}');
  expect(onSubmit).not.toHaveBeenCalled();
});

it('submits when not loading', async () => {
  const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <input aria-label="q" />
      <Button type="submit">Go</Button>
    </form>,
  );
  await userEvent.type(screen.getByLabelText('q'), 'x{Enter}');
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it('as="a" renders a link with no role="button"', () => {
  render(
    <Button as="a" href="/x">
      Docs
    </Button>,
  );
  const link = screen.getByRole('link', { name: 'Docs' });
  expect(link).not.toHaveAttribute('role');
  expect(link).not.toHaveAttribute('type');
  expect(link).toHaveAttribute('href', '/x');
});

it('renders a router link through as', () => {
  const RouterLink = ({
    children,
    ...p
  }: {
    href: string;
    children?: React.ReactNode;
  }) => (
    <a data-router {...p}>
      {children}
    </a>
  );
  render(
    <Button as={RouterLink} href="/x">
      Docs
    </Button>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('data-router');
});

it.each(['disabled', 'loading'] as const)('warns for %s on a link', (prop) => {
  const warn = warnSpy();
  render(
    <Button as="a" href="/x" {...{ [prop]: true }}>
      Docs
    </Button>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/Button.*link/);
  warn.mockRestore();
});

it('a disabled button is not focusable and sets data-disabled', async () => {
  render(<Button disabled>Save</Button>);
  const b = screen.getByRole('button');
  expect(b).toBeDisabled();
  expect(b).toHaveAttribute('data-disabled');
  await userEvent.tab();
  expect(b).not.toHaveFocus();
});

it('ref reaches the button element', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Save</Button>);
  expect(ref.current).toBe(screen.getByRole('button'));
});

it('accepts layout props', () => {
  render(
    <Button marginTop="auto" width="full">
      Save
    </Button>,
  );
  expect(screen.getByRole('button').className).toMatch(/marginTop|width/);
});

it('replaces the start icon with a spinner while loading', () => {
  render(
    <Button loading startIcon={<Icon icon={ArrowUpIcon} data-testid="start" />}>
      Save
    </Button>,
  );
  expect(screen.queryByTestId('start')).toBeNull();
  expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

it('renders start and end icons around the text', () => {
  render(
    <Button
      startIcon={<Icon icon={ArrowUpIcon} data-testid="start" />}
      endIcon={<Icon icon={ArrowUpIcon} data-testid="end" />}
    >
      Save
    </Button>,
  );
  const b = screen.getByRole('button', { name: 'Save' });
  expect(b.firstElementChild).toContainElement(screen.getByTestId('start'));
  expect(b.lastElementChild).toContainElement(screen.getByTestId('end'));
});
