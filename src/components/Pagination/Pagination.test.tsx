import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Pagination } from './Pagination';

// jsdom loads no CSS, so both layouts are present: the full list first, then
// the compact one.
function full() {
  return screen.getByRole('navigation').querySelector('ol')!;
}

const noop = (page: number) => void page;
const getHref = (p: number) => `/items?page=${p}`;

it('getHref renders links, with as', () => {
  const RouterLink = forwardRef<
    HTMLAnchorElement,
    ComponentPropsWithoutRef<'a'>
  >(function RouterLink({ children, ...props }, ref) {
    return (
      <a ref={ref} data-router="" {...props}>
        {children}
      </a>
    );
  });
  render(
    <Pagination page={3} totalPages={10} getHref={getHref} as={RouterLink} />,
  );
  const link = within(full()).getByRole('link', { name: 'Page 4' });
  expect(link).toHaveAttribute('href', '/items?page=4');
  expect(link).toHaveAttribute('data-router');
});

it('links default to a', () => {
  render(<Pagination page={3} totalPages={10} getHref={getHref} />);
  expect(within(full()).getByRole('link', { name: 'Page 2' }).tagName).toBe(
    'A',
  );
});

it('onPageChange renders buttons and receives the page', async () => {
  const onPageChange = vi.fn();
  render(<Pagination page={3} totalPages={10} onPageChange={onPageChange} />);
  expect(within(full()).queryByRole('link')).toBeNull();
  await userEvent.click(within(full()).getByRole('button', { name: 'Page 4' }));
  expect(onPageChange).toHaveBeenLastCalledWith(4);
  await userEvent.click(
    within(full()).getByRole('button', { name: 'Previous' }),
  );
  expect(onPageChange).toHaveBeenLastCalledWith(2);
  await userEvent.click(within(full()).getByRole('button', { name: 'Next' }));
  expect(onPageChange).toHaveBeenLastCalledWith(4);
});

it('marks the current page', () => {
  render(<Pagination page={3} totalPages={10} onPageChange={noop} />);
  const current = within(full()).getByRole('button', { name: 'Page 3' });
  expect(current).toHaveAttribute('aria-current', 'page');
  expect(current).toHaveAttribute('data-current');
  const other = within(full()).getByRole('button', { name: 'Page 2' });
  expect(other).not.toHaveAttribute('aria-current');
  expect(other).not.toHaveAttribute('data-current');
});

it.each([
  ['links', { getHref }],
  ['buttons', { onPageChange: noop }],
] as const)('the ends render a disabled button in %s mode', (_, mode) => {
  const { unmount } = render(<Pagination page={1} totalPages={5} {...mode} />);
  const previous = screen.getAllByRole('button', { name: 'Previous' });
  expect(previous).toHaveLength(2);
  for (const button of previous) expect(button).toBeDisabled();
  unmount();
  render(<Pagination page={5} totalPages={5} {...mode} />);
  for (const button of screen.getAllByRole('button', { name: 'Next' })) {
    expect(button).toBeDisabled();
  }
});

it('renders nothing for 0 or 1 pages', () => {
  const { container, rerender } = render(
    <Pagination page={1} totalPages={1} onPageChange={noop} />,
  );
  expect(container).toBeEmptyDOMElement();
  rerender(<Pagination page={1} totalPages={0} onPageChange={noop} />);
  expect(container).toBeEmptyDOMElement();
});

it('warns about a page out of range', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
  render(<Pagination page={11} totalPages={10} onPageChange={noop} />);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Pagination'));
  warn.mockRestore();
});

it('hides ellipses from assistive technology', () => {
  render(<Pagination page={1} totalPages={20} onPageChange={noop} />);
  const ellipses = full().querySelectorAll('li[aria-hidden="true"]');
  expect(ellipses).toHaveLength(1);
  expect(ellipses[0]).toHaveTextContent('…');
});

it('interpolates labels', () => {
  render(
    <Pagination
      page={3}
      totalPages={10}
      onPageChange={noop}
      labels={{
        previous: 'Zurück',
        next: 'Weiter',
        page: 'Seite {page}',
        status: 'Seite {page} von {total}',
      }}
    />,
  );
  expect(screen.getAllByRole('button', { name: 'Zurück' })).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Seite 4' })).toBeInTheDocument();
  expect(screen.getByText('Seite 3 von 10')).toBeInTheDocument();
});

it('defaults the status text and nav label', () => {
  render(<Pagination page={3} totalPages={10} onPageChange={noop} />);
  expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Pagination' }),
  ).toBeInTheDocument();
});

it('accepts aria-label and layout props', () => {
  render(
    <Pagination
      page={2}
      totalPages={3}
      onPageChange={noop}
      aria-label="Customers pages"
      marginY="4"
    />,
  );
  expect(
    screen.getByRole('navigation', { name: 'Customers pages' }),
  ).toBeInTheDocument();
});
