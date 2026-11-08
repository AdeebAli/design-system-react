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
  const a = screen.getByRole('link');
  // Chrome's name is checked in the fixtures. Testing Library's name
  // computation trims the hidden text's leading space, which browsers keep.
  expect(a.textContent).toBe('Docs (opens in a new tab)');
  expect(a).toHaveAttribute('target', '_blank');
  expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  expect(a.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('external adds no visible space, so punctuation can follow it', () => {
  render(
    <Link href="/x" external data-testid="a">
      Docs
    </Link>,
  );
  const a = screen.getByTestId('a');
  const blank = [...a.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && !node.textContent?.trim(),
  );
  expect(blank).toHaveLength(0);
  expect(a.textContent).toBe('Docs (opens in a new tab)');
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

it('external with another target drops the new-tab icon and text', () => {
  render(
    <Link href="/x" external target="_self">
      Docs
    </Link>,
  );
  const a = screen.getByRole('link');
  expect(a.textContent).toBe('Docs');
  expect(a.querySelector('svg')).toBeNull();
  expect(a).toHaveAttribute('target', '_self');
});

it('external with an explicit _blank target keeps the icon and text', () => {
  render(
    <Link href="/x" external target="_blank">
      Docs
    </Link>,
  );
  const a = screen.getByRole('link');
  expect(a.textContent).toBe('Docs (opens in a new tab)');
  expect(a.querySelector('svg')).not.toBeNull();
});

it('externalLabel changes the hidden text', () => {
  render(
    <Link href="/x" external externalLabel="(neue Registerkarte)">
      Docs
    </Link>,
  );
  expect(screen.getByRole('link').textContent).toBe(
    'Docs (neue Registerkarte)',
  );
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
