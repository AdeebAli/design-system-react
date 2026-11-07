import { render, screen } from '@testing-library/react';
import { createRef, type ComponentProps } from 'react';
import { Link } from './index';

it('renders an a, without external behavior by default', () => {
  render(<Link href="/x">Docs</Link>);
  const a = screen.getByRole('link', { name: 'Docs' });
  expect(a.tagName).toBe('A');
  expect(a).not.toHaveAttribute('target');
  expect(a).not.toHaveAttribute('rel');
  expect(a.querySelector('svg')).toBeNull();
});

it('external sets target, rel, an icon, and hidden text', () => {
  render(
    <Link href="/x" external>
      Docs
    </Link>,
  );
  const a = screen.getByRole('link', { name: 'Docs (opens in a new tab)' });
  expect(a).toHaveAttribute('target', '_blank');
  expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  expect(a.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('explicit target and rel override external', () => {
  render(
    <Link href="/x" external target="_self" rel="nofollow">
      Docs
    </Link>,
  );
  const a = screen.getByRole('link');
  expect(a).toHaveAttribute('target', '_self');
  expect(a).toHaveAttribute('rel', 'nofollow');
});

it('externalLabel changes the hidden text', () => {
  render(
    <Link href="/x" external externalLabel="(neue Registerkarte)">
      Docs
    </Link>,
  );
  expect(
    screen.getByRole('link', { name: 'Docs (neue Registerkarte)' }),
  ).toBeInTheDocument();
});

it('renders as a router link', () => {
  const Router = ({ children, ...props }: ComponentProps<'a'>) => (
    <a data-router {...props}>
      {children}
    </a>
  );
  render(
    <Link as={Router} href="/x">
      x
    </Link>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('data-router');
});

it('tone and underline change classes, and are not forwarded', () => {
  render(
    <Link href="/a" data-testid="a">
      a
    </Link>,
  );
  render(
    <Link href="/b" data-testid="b" tone="neutral" underline="hover">
      b
    </Link>,
  );
  const b = screen.getByTestId('b');
  expect(b.className).not.toBe(screen.getByTestId('a').className);
  expect(b.getAttribute('tone')).toBeNull();
  expect(b.getAttribute('underline')).toBeNull();
});

it('never forwards external props, and passes className and ref', () => {
  const ref = createRef<HTMLAnchorElement>();
  render(
    <Link
      href="/x"
      external
      externalLabel="new"
      className="mine"
      ref={ref}
      data-testid="a"
    >
      x
    </Link>,
  );
  const a = screen.getByTestId('a');
  expect(a.getAttribute('external')).toBeNull();
  expect(a.getAttribute('externallabel')).toBeNull();
  expect(a).toHaveClass('mine');
  expect(ref.current).toBe(a);
});
