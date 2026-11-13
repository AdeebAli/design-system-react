import { render, screen, within } from '@testing-library/react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { BreadcrumbItem, Breadcrumbs } from './index';

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  function RouterLink({ children, ...props }, ref) {
    return (
      <a ref={ref} data-router="" {...props}>
        {children}
      </a>
    );
  },
);

function Trail() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/customers">Customers</BreadcrumbItem>
      <BreadcrumbItem as={RouterLink} href="/customers/acme">
        Acme
      </BreadcrumbItem>
      <BreadcrumbItem current>Invoices</BreadcrumbItem>
    </Breadcrumbs>
  );
}

it('renders a nav named Breadcrumbs, holding an ol with an li per item', () => {
  render(<Trail />);
  const nav = screen.getByRole('navigation', { name: 'Breadcrumbs' });
  const list = nav.firstElementChild!;
  expect(list.tagName).toBe('OL');
  expect([...list.children].map((child) => child.tagName)).toEqual([
    'LI',
    'LI',
    'LI',
  ]);
});

it('aria-label renames the nav', () => {
  render(
    <Breadcrumbs aria-label="You are here">
      <BreadcrumbItem current>Home</BreadcrumbItem>
    </Breadcrumbs>,
  );
  expect(
    screen.getByRole('navigation', { name: 'You are here' }),
  ).toBeInTheDocument();
});

it('items are links to their href', () => {
  render(<Trail />);
  expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
    'href',
    '/customers',
  );
});

it('as renders the router link', () => {
  render(<Trail />);
  const link = screen.getByRole('link', { name: 'Acme' });
  expect(link).toHaveAttribute('data-router');
  expect(link).toHaveAttribute('href', '/customers/acme');
});

it('current renders a span with aria-current and data-current', () => {
  render(<Trail />);
  const current = screen.getByText('Invoices');
  expect(current.tagName).toBe('SPAN');
  expect(current).toHaveAttribute('aria-current', 'page');
  expect(current).toHaveAttribute('data-current');
  expect(
    within(screen.getByRole('navigation')).queryByRole('link', {
      name: 'Invoices',
    }),
  ).toBeNull();
});

it('links have no aria-current or data-current', () => {
  render(<Trail />);
  const link = screen.getByRole('link', { name: 'Customers' });
  expect(link).not.toHaveAttribute('aria-current');
  expect(link).not.toHaveAttribute('data-current');
});

it('size changes the class, and defaults to sm', () => {
  const { rerender } = render(
    <Breadcrumbs>
      <BreadcrumbItem current>Home</BreadcrumbItem>
    </Breadcrumbs>,
  );
  const small = screen.getByRole('navigation').className;
  rerender(
    <Breadcrumbs size="sm">
      <BreadcrumbItem current>Home</BreadcrumbItem>
    </Breadcrumbs>,
  );
  expect(screen.getByRole('navigation').className).toBe(small);
  rerender(
    <Breadcrumbs size="md">
      <BreadcrumbItem current>Home</BreadcrumbItem>
    </Breadcrumbs>,
  );
  expect(screen.getByRole('navigation').className).not.toBe(small);
});
