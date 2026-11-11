import { fireEvent, render, screen, within } from '@testing-library/react';
import { box } from '../Box';
import { useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
  type DataTableSort,
} from './index';

interface Person {
  id: string;
  name: string;
  age: number | null;
}

const people: Person[] = [
  { id: '1', name: 'Cara', age: 30 },
  { id: '2', name: 'Ada', age: 20 },
  { id: '3', name: 'Bo', age: null },
];

const columns: DataTableColumn<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (p) => p.name,
    sortValue: (p) => p.name,
    rowHeader: true,
  },
  {
    id: 'age',
    header: 'Age',
    cell: (p) => String(p.age),
    sortValue: (p) => p.age,
  },
];

interface SampleProps {
  rows?: Person[];
  columns?: DataTableColumn<Person>[];
  sort?: DataTableSort;
  defaultSort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalRows?: number;
  loading?: boolean;
  empty?: ReactNode;
  locale?: string;
  className?: string;
  style?: CSSProperties;
  marginTop?: '4';
  maxHeight?: 'screen';
  ref?: Ref<HTMLTableElement>;
}

function Sample(props: SampleProps) {
  const all = {
    'aria-label': 'People',
    rows: people,
    columns,
    getRowId: (p: Person) => p.id,
    ...props,
  };
  return <DataTable {...(all as unknown as DataTableProps<Person>)} />;
}

const names = () =>
  screen.getAllByRole('rowheader').map((cell) => cell.textContent);
const sortButton = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`^${name}`) });
const pageButton = (n: number) =>
  within(screen.getByRole('navigation').querySelector('ol')!).getByRole(
    'button',
    { name: `Page ${n}` },
  );

afterEach(() => vi.restoreAllMocks());

it('is a table, never a grid', () => {
  render(<Sample />);
  expect(screen.getByRole('table', { name: 'People' })).toBeInTheDocument();
  expect(screen.queryByRole('grid')).toBeNull();
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
});

it('cycles a sortable header ascending, descending, then unsorted', () => {
  render(<Sample />);
  const header = screen.getByRole('columnheader', { name: /Name/ });
  fireEvent.click(sortButton('Name'));
  expect(names()).toEqual(['Ada', 'Bo', 'Cara']);
  expect(header).toHaveAttribute('aria-sort', 'ascending');
  fireEvent.click(sortButton('Name'));
  expect(names()).toEqual(['Cara', 'Bo', 'Ada']);
  expect(header).toHaveAttribute('aria-sort', 'descending');
  fireEvent.click(sortButton('Name'));
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
  expect(header).not.toHaveAttribute('aria-sort');
});

it('sorts null last in both directions and only one column at a time', () => {
  render(<Sample />);
  fireEvent.click(sortButton('Age'));
  expect(names()).toEqual(['Ada', 'Cara', 'Bo']);
  fireEvent.click(sortButton('Age'));
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
  fireEvent.click(sortButton('Name'));
  expect(screen.getByRole('columnheader', { name: /Age/ })).toHaveAttribute(
    'data-direction',
    'none',
  );
});

it('sortable reports through onSortChange without reordering', () => {
  const onSortChange = vi.fn();
  render(
    <Sample
      columns={[
        { ...columns[0]!, sortValue: undefined, sortable: true },
        columns[1]!,
      ]}
      onSortChange={onSortChange}
    />,
  );
  fireEvent.click(sortButton('Name'));
  expect(onSortChange).toHaveBeenCalledWith({
    column: 'name',
    direction: 'ascending',
  });
  expect(onSortChange).toHaveBeenCalledTimes(1);
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
});

it('a controlled sort still sorts locally and only moves state to the project', () => {
  const onSortChange = vi.fn();
  const { rerender } = render(
    <Sample
      sort={{ column: 'name', direction: 'descending' }}
      onSortChange={onSortChange}
    />,
  );
  expect(names()).toEqual(['Cara', 'Bo', 'Ada']);
  fireEvent.click(sortButton('Name'));
  expect(onSortChange).toHaveBeenCalledWith(null);
  expect(names()).toEqual(['Cara', 'Bo', 'Ada']);
  rerender(<Sample sort={null} onSortChange={onSortChange} />);
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
});

it('an uncontrolled defaultSort starts sorted', () => {
  render(<Sample defaultSort={{ column: 'name', direction: 'ascending' }} />);
  expect(names()).toEqual(['Ada', 'Bo', 'Cara']);
});

it('pageSize slices rows and renders Pagination', () => {
  render(<Sample pageSize={2} />);
  expect(names()).toEqual(['Cara', 'Ada']);
  fireEvent.click(pageButton(2));
  expect(names()).toEqual(['Bo']);
});

it('calls onPageChange with the page, and controlled page is shown as given', () => {
  const onPageChange = vi.fn();
  render(<Sample pageSize={2} page={1} onPageChange={onPageChange} />);
  fireEvent.click(pageButton(2));
  expect(onPageChange).toHaveBeenCalledWith(2);
  expect(names()).toEqual(['Cara', 'Ada']);
});

it('changing the sort returns to page 1', () => {
  const onPageChange = vi.fn();
  render(<Sample pageSize={2} onPageChange={onPageChange} />);
  fireEvent.click(pageButton(2));
  fireEvent.click(sortButton('Name'));
  expect(names()).toEqual(['Ada', 'Bo']);
  expect(onPageChange).toHaveBeenLastCalledWith(1);
});

it('moves an uncontrolled page past the end to the last page when rows shrink', () => {
  const { rerender } = render(<Sample pageSize={2} />);
  fireEvent.click(pageButton(2));
  rerender(<Sample pageSize={2} rows={people.slice(0, 2)} />);
  expect(names()).toEqual(['Cara', 'Ada']);
  expect(screen.queryByRole('navigation')).toBeNull();
});

it('totalRows does not slice, and sets the page count', () => {
  render(
    <Sample
      pageSize={2}
      totalRows={10}
      defaultPage={2}
      columns={[{ ...columns[0]!, sortValue: undefined }]}
    />,
  );
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
  expect(pageButton(5)).toBeInTheDocument();
});

it('warns to use sortable when totalRows comes with sortValue', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(<Sample pageSize={2} totalRows={10} />);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/DataTable.*sortable/);
});

it('loading with no rows shows pageSize skeleton rows and beats empty', () => {
  const { container } = render(
    <Sample rows={[]} loading pageSize={3} empty={<p>Nothing</p>} />,
  );
  expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
  expect(
    container.querySelectorAll('tbody [aria-hidden="true"]').length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText('Nothing')).toBeNull();
  expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
});

it('loading with no pageSize shows 5 skeleton rows', () => {
  const { container } = render(<Sample rows={[]} loading />);
  expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
});

it('loading with rows keeps them and sets aria-busy', () => {
  const { container } = render(<Sample loading />);
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
  expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
});

it('is not busy when not loading', () => {
  const { container } = render(<Sample />);
  expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
});

it('empty renders in one full-width row', () => {
  const { container } = render(<Sample rows={[]} empty={<p>Nothing</p>} />);
  const rows = container.querySelectorAll('tbody tr');
  expect(rows).toHaveLength(1);
  const cell = rows[0]!.querySelector('td')!;
  expect(cell).toHaveAttribute('colspan', '2');
  expect(cell).toHaveTextContent('Nothing');
});

it('warns without exactly one rowHeader', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(
    <Sample columns={[{ ...columns[0]!, rowHeader: false }, columns[1]!]} />,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/DataTable.*rowHeader/);
});

it('sorts strings by locale', () => {
  const rows = [
    { id: '1', name: 'ä', age: 1 },
    { id: '2', name: 'z', age: 2 },
  ];
  render(
    <Sample
      rows={rows}
      locale="sv-SE"
      defaultSort={{ column: 'name', direction: 'ascending' }}
    />,
  );
  expect(names()).toEqual(['z', 'ä']);
});

it('routes layout props to the outer element, height to the wrapper, and className, ref and style to the table', () => {
  const ref = { current: null as HTMLTableElement | null };
  const { container } = render(
    <Sample
      ref={ref}
      className="mine"
      style={{ color: 'red' }}
      marginTop="4"
      maxHeight="screen"
    />,
  );
  const table = screen.getByRole('table');
  const outer = container.firstElementChild!;
  const wrapper = table.parentElement!;
  const marginClasses = box({ marginTop: '4' }).split(' ');
  const maxHeightClasses = box({ maxHeight: 'screen' }).split(' ');
  const has = (el: Element, classes: string[]) =>
    classes.every((c) => el.classList.contains(c));
  expect(ref.current).toBe(table);
  expect(outer).not.toBe(wrapper);
  expect(wrapper).toHaveAttribute('data-ds-table');
  expect(has(outer, marginClasses)).toBe(true);
  expect(has(wrapper, marginClasses)).toBe(false);
  expect(has(table, marginClasses)).toBe(false);
  expect(has(wrapper, maxHeightClasses)).toBe(true);
  expect(has(outer, maxHeightClasses)).toBe(false);
  expect(table).toHaveClass('mine');
  expect(table.style.color).toBe('red');
  expect(outer).not.toHaveClass('mine');
  expect((outer as HTMLElement).style.color).toBe('');
  expect(wrapper).not.toHaveClass('mine');
});

it('works with state held by the project', () => {
  function Host() {
    const [sort, setSort] = useState<DataTableSort>(null);
    return <Sample sort={sort} onSortChange={setSort} />;
  }
  render(<Host />);
  fireEvent.click(sortButton('Name'));
  expect(names()).toEqual(['Ada', 'Bo', 'Cara']);
});

it('renders with a NaN totalRows instead of looping', () => {
  render(<Sample pageSize={2} totalRows={NaN} />);
  expect(names()).toEqual(['Cara', 'Ada']);
  expect(pageButton(2)).toBeInTheDocument();
});

it('shows the first page for a controlled page below 1', () => {
  render(<Sample pageSize={2} page={-1} />);
  expect(names()).toEqual(['Cara', 'Ada']);
});

it('clamps a controlled page past the end and truncates fractions', () => {
  const { rerender } = render(<Sample pageSize={2} page={99} />);
  expect(names()).toEqual(['Bo']);
  rerender(<Sample pageSize={2} page={1.7} />);
  expect(names()).toEqual(['Cara', 'Ada']);
  rerender(<Sample pageSize={2} page={NaN} />);
  expect(names()).toEqual(['Cara', 'Ada']);
});

it('ignores an invalid pageSize and warns', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(<Sample pageSize={0} />);
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(warn.mock.calls[0]?.[0]).toMatch(/DataTable.*pageSize/);
});

it('falls back to the default collator for an invalid locale and warns', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(
    <Sample
      locale="not a locale!"
      defaultSort={{ column: 'name', direction: 'ascending' }}
    />,
  );
  expect(names()).toEqual(['Ada', 'Bo', 'Cara']);
  expect(warn.mock.calls[0]?.[0]).toMatch(/DataTable.*not a locale!/);
});
