import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { box } from '../Box';
import * as styles from './Table.css';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from './index';

function Sample(props: ComponentProps<typeof Table>) {
  return (
    <Table {...props}>
      <TableCaption>People</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeader scope="row">Ada</TableHeader>
          <TableCell align="end">1</TableCell>
        </TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}

afterEach(() => vi.restoreAllMocks());

it('renders each part as its element', () => {
  render(<Sample aria-label="People" />);
  const table = screen.getByRole('table', { name: 'People' });
  expect(table.tagName).toBe('TABLE');
  expect(table.querySelector('caption')).toHaveTextContent('People');
  expect(table.querySelector('thead')).not.toBeNull();
  expect(table.querySelector('tbody')).not.toBeNull();
  expect(table.querySelector('tfoot')).not.toBeNull();
  expect(table.querySelectorAll('tr')).toHaveLength(3);
  expect(table.querySelectorAll('td')).toHaveLength(2);
});

it('keeps a visually hidden caption as the caption element', () => {
  render(
    <Table>
      <TableCaption visuallyHidden>Hidden</TableCaption>
    </Table>,
  );
  expect(screen.getByRole('table', { name: 'Hidden' })).toBeInTheDocument();
  expect(screen.getByText('Hidden').tagName).toBe('CAPTION');
});

it('defaults TableHeader to scope col and applies scope and align', () => {
  render(
    <Table aria-label="t">
      <TableHead>
        <TableRow>
          <TableHeader>A</TableHeader>
          <TableHeader scope="row" align="center">
            B
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell align="end">C</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(screen.getByText('A')).toHaveAttribute('scope', 'col');
  expect(screen.getByText('B')).toHaveAttribute('scope', 'row');
  expect(screen.getByText('B')).toHaveAttribute('data-align', 'center');
  expect(screen.getByText('A')).toHaveAttribute('data-align', 'start');
  expect(screen.getByText('C')).toHaveAttribute('data-align', 'end');
});

it('passes native cell attributes through', () => {
  render(
    <Table aria-label="t">
      <TableBody>
        <TableRow>
          <TableCell colSpan={2}>x</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(screen.getByText('x')).toHaveAttribute('colspan', '2');
});

it('marks a selected row and turns hover off for one row', () => {
  render(
    <Table aria-label="t">
      <TableBody>
        <TableRow selected data-testid="a">
          <TableCell>a</TableCell>
        </TableRow>
        <TableRow hoverable={false} data-testid="b">
          <TableCell>b</TableCell>
        </TableRow>
        <TableRow data-testid="c">
          <TableCell>c</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(screen.getByTestId('a')).toHaveAttribute('data-selected');
  expect(screen.getByTestId('b')).not.toHaveAttribute('data-selected');
  expect(screen.getByTestId('b')).toHaveAttribute('data-no-hover');
  expect(screen.getByTestId('c')).not.toHaveAttribute('data-no-hover');
});

it('puts the layout props on the wrapper and the rest on the table', () => {
  const { container } = render(
    <Table
      aria-label="t"
      className="mine"
      maxHeight="screen"
      data-testid="t"
    />,
  );
  const wrapper = container.firstElementChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-ds-table');
  expect(wrapper.tagName).toBe('DIV');
  expect(wrapper.className).not.toContain('mine');
  const table = screen.getByTestId('t');
  expect(table.parentElement).toBe(wrapper);
  const layoutClass = box({ maxHeight: 'screen' });
  expect(layoutClass).not.toBe('');
  expect(wrapper).toHaveClass(...layoutClass.split(' '));
  for (const name of layoutClass.split(' ')) {
    expect(table).not.toHaveClass(name);
  }
  expect(table).toHaveClass('mine');
  expect(table).toHaveAttribute('aria-label', 't');
  expect(table).not.toHaveAttribute('maxheight');
});

it('forwards ref to the table', () => {
  const ref = { current: null as HTMLTableElement | null };
  render(<Table aria-label="t" ref={ref} />);
  expect(ref.current?.tagName).toBe('TABLE');
});

it('scrollable makes the wrapper a named, focusable region', () => {
  const { container } = render(<Table aria-label="People" scrollable />);
  const wrapper = container.firstElementChild as HTMLElement;
  expect(wrapper).toHaveAttribute('role', 'region');
  expect(wrapper).toHaveAttribute('tabindex', '0');
  expect(wrapper).toHaveAttribute('aria-label', 'People');
  expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'People');
});

it('scrollable uses aria-labelledby for the region too', () => {
  const { container } = render(
    <>
      <h2 id="h">People</h2>
      <Table aria-labelledby="h" scrollable />
    </>,
  );
  const wrapper = container.querySelector('[data-ds-table]');
  expect(wrapper).toHaveAttribute('aria-labelledby', 'h');
  expect(screen.getByRole('region', { name: 'People' })).toBe(wrapper);
});

it('without scrollable, the wrapper has no role or tab stop', () => {
  const { container } = render(<Table aria-label="People" />);
  const wrapper = container.firstElementChild as HTMLElement;
  expect(wrapper).not.toHaveAttribute('role');
  expect(wrapper).not.toHaveAttribute('tabindex');
  expect(wrapper).not.toHaveAttribute('aria-label');
});

it('warns once when scrollable has no name', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(<Table scrollable />);
  render(<Table scrollable />);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/Table.*aria-label/);
});

it('does not warn when scrollable has a name', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(<Table scrollable aria-label="x" />);
  expect(warn).not.toHaveBeenCalled();
});

function sortable(props: ComponentProps<typeof TableSortHeader>) {
  return render(
    <Table aria-label="t">
      <TableHead>
        <TableRow>
          {<TableSortHeader {...props}>Name</TableSortHeader>}
        </TableRow>
      </TableHead>
    </Table>,
  );
}

it.each(['ascending', 'descending'] as const)(
  'sets aria-sort and data-direction for %s',
  (direction) => {
    sortable({ direction, onSort: vi.fn() });
    const th = screen.getByRole('columnheader');
    expect(th).toHaveAttribute('aria-sort', direction);
    expect(th).toHaveAttribute('data-direction', direction);
  },
);

it('omits aria-sort for none', () => {
  sortable({ direction: 'none', onSort: vi.fn() });
  const th = screen.getByRole('columnheader');
  expect(th).not.toHaveAttribute('aria-sort');
  expect(th).toHaveAttribute('data-direction', 'none');
});

it('renders a button that calls onSort with no arguments', () => {
  const onSort = vi.fn();
  sortable({ direction: 'none', onSort });
  const button = screen.getByRole('button', { name: 'Name' });
  expect(button).toHaveAttribute('type', 'button');
  fireEvent.click(button);
  expect(onSort).toHaveBeenCalledTimes(1);
  expect(onSort).toHaveBeenCalledWith();
  expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('renders a link for href', () => {
  sortable({ direction: 'ascending', href: '?sort=name' });
  const link = screen.getByRole('link', { name: 'Name' });
  expect(link).toHaveAttribute('href', '?sort=name');
  expect(screen.queryByRole('button')).toBeNull();
});

it('renders a router link for as', () => {
  function RouterLink(props: ComponentProps<'a'>) {
    return (
      <a data-router {...props}>
        {props.children}
      </a>
    );
  }
  sortable({ direction: 'none', href: '/x', as: RouterLink });
  expect(screen.getByRole('link')).toHaveAttribute('data-router');
});

it('aligns a sort header', () => {
  sortable({ direction: 'none', onSort: vi.fn(), align: 'end' });
  expect(screen.getByRole('columnheader')).toHaveAttribute('data-align', 'end');
});

it('hoverable={false} drops the hover class', () => {
  const { rerender } = render(<Table aria-label="t" data-testid="t" />);
  expect(screen.getByTestId('t')).toHaveClass(styles.hoverable);
  rerender(<Table aria-label="t" data-testid="t" hoverable={false} />);
  expect(screen.getByTestId('t')).not.toHaveClass(styles.hoverable);
});

it('size sets data-size, defaulting to md', () => {
  const { rerender } = render(<Table aria-label="t" data-testid="t" />);
  expect(screen.getByTestId('t')).toHaveAttribute('data-size', 'md');
  rerender(<Table aria-label="t" data-testid="t" size="sm" />);
  expect(screen.getByTestId('t')).toHaveAttribute('data-size', 'sm');
});

it('the sticky props set data attributes on the table only when on', () => {
  const { rerender } = render(<Table aria-label="t" data-testid="t" />);
  const table = () => screen.getByTestId('t');
  expect(table()).not.toHaveAttribute('data-sticky-header');
  expect(table()).not.toHaveAttribute('data-sticky-column');
  rerender(
    <Table aria-label="t" data-testid="t" stickyHeader stickyFirstColumn />,
  );
  expect(table()).toHaveAttribute('data-sticky-header');
  expect(table()).toHaveAttribute('data-sticky-column');
});
