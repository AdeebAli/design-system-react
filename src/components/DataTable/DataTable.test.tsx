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
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  disabledKeys?: string[];
  selectOnRowClick?: boolean;
  labels?: Record<string, string>;
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

const rowButton = (name: string) =>
  screen.getByRole('button', { name: `Select ${name}` });
const selectPage = () => screen.getByRole('button', { name: 'Select page' });

it('renders no selection button without selectionMode', () => {
  render(<Sample />);
  expect(screen.queryByRole('button', { name: /^Select/ })).toBeNull();
  expect(screen.queryByRole('group')).toBeNull();
  expect(names()).toEqual(['Cara', 'Ada', 'Bo']);
});

it('makes the rowHeader cell a toggle button named by the hidden label then the text', () => {
  render(<Sample selectionMode="single" labels={{ selectRow: 'Pick' }} />);
  const button = screen.getByRole('button', { name: 'Pick Cara' });
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(button.closest('th')).toHaveAttribute('scope', 'row');
  expect(screen.queryByRole('grid')).toBeNull();
  expect(screen.queryByRole('group')).toBeNull();
});

it('single replaces the selection and clears it when the selected row toggles', () => {
  const onSelectionChange = vi.fn();
  render(
    <Sample selectionMode="single" onSelectionChange={onSelectionChange} />,
  );
  fireEvent.click(rowButton('Cara'));
  expect(rowButton('Cara')).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(rowButton('Ada'));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['2']);
  expect(rowButton('Cara')).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(rowButton('Ada'));
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  expect(rowButton('Ada')).toHaveAttribute('aria-pressed', 'false');
});

it('multiple adds and removes, and works controlled and uncontrolled', () => {
  const onSelectionChange = vi.fn();
  const { rerender } = render(
    <Sample
      selectionMode="multiple"
      selectedKeys={['1']}
      onSelectionChange={onSelectionChange}
    />,
  );
  fireEvent.click(rowButton('Ada'));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2']);
  // Controlled: nothing changes until the project passes new keys.
  expect(rowButton('Ada')).toHaveAttribute('aria-pressed', 'false');
  rerender(
    <Sample
      selectionMode="multiple"
      selectedKeys={['1', '2']}
      onSelectionChange={onSelectionChange}
    />,
  );
  expect(rowButton('Ada')).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(rowButton('Cara'));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['2']);
});

it('starts from defaultSelectedKeys', () => {
  render(<Sample selectionMode="multiple" defaultSelectedKeys={['3']} />);
  expect(rowButton('Bo')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Bo').closest('tr')).toHaveAttribute('data-selected');
});

it('shows a check icon only on a selected row', () => {
  render(<Sample selectionMode="multiple" defaultSelectedKeys={['3']} />);
  expect(rowButton('Bo').querySelector('svg')).not.toBeNull();
  expect(rowButton('Ada').querySelector('svg')).toBeNull();
});

it('disables the button for disabledKeys but keeps its text color class', () => {
  render(<Sample selectionMode="multiple" disabledKeys={['2']} />);
  expect(rowButton('Ada')).toBeDisabled();
  expect(rowButton('Cara')).not.toBeDisabled();
  expect(rowButton('Ada').className).toBe(rowButton('Cara').className);
});

it('multiple renders a named group with Select page, a count and Clear', () => {
  render(<Sample selectionMode="multiple" />);
  const group = screen.getByRole('group', { name: 'Selection' });
  expect(
    within(group).getByRole('button', { name: 'Select page' }),
  ).toBeInTheDocument();
  expect(
    within(group).getByRole('button', { name: 'Clear' }),
  ).toBeInTheDocument();
  expect(group.nextElementSibling).toBe(
    screen.getByRole('table').parentElement,
  );
});

it('has no toolbar for single', () => {
  render(<Sample selectionMode="single" />);
  expect(screen.queryByRole('group')).toBeNull();
});

it('moves Select page through false, mixed and true, skipping disabled rows', () => {
  const onSelectionChange = vi.fn();
  render(
    <Sample
      selectionMode="multiple"
      disabledKeys={['2']}
      onSelectionChange={onSelectionChange}
    />,
  );
  expect(selectPage()).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(rowButton('Cara'));
  expect(selectPage()).toHaveAttribute('aria-pressed', 'mixed');
  fireEvent.click(selectPage());
  expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '3']);
  expect(selectPage()).toHaveAttribute('aria-pressed', 'true');
  expect(rowButton('Ada')).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(selectPage());
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  expect(selectPage()).toHaveAttribute('aria-pressed', 'false');
});

it('Select page does nothing when every row on the page is disabled', () => {
  const onSelectionChange = vi.fn();
  render(
    <Sample
      selectionMode="multiple"
      disabledKeys={['1', '2', '3']}
      onSelectionChange={onSelectionChange}
    />,
  );
  expect(selectPage()).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(selectPage());
  expect(onSelectionChange).not.toHaveBeenCalled();
  expect(selectPage()).toHaveAttribute('aria-pressed', 'false');
});

it('keeps off-page selections and reports every key', () => {
  const onSelectionChange = vi.fn<(keys: string[]) => void>();
  render(
    <Sample
      selectionMode="multiple"
      pageSize={2}
      defaultSelectedKeys={['3']}
      onSelectionChange={onSelectionChange}
    />,
  );
  fireEvent.click(selectPage());
  expect([...onSelectionChange.mock.lastCall![0]].sort()).toEqual([
    '1',
    '2',
    '3',
  ]);
  fireEvent.click(pageButton(2));
  expect(rowButton('Bo')).toHaveAttribute('aria-pressed', 'true');
  expect(selectPage()).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(rowButton('Bo'));
  expect([...onSelectionChange.mock.lastCall![0]].sort()).toEqual(['1', '2']);
});

it('Clear empties the selection, including off-page keys', () => {
  const onSelectionChange = vi.fn();
  render(
    <Sample
      selectionMode="multiple"
      pageSize={2}
      defaultSelectedKeys={['3']}
      onSelectionChange={onSelectionChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
});

it('renders the status empty at first and announces each change', () => {
  render(<Sample selectionMode="multiple" defaultSelectedKeys={['3']} />);
  const status = screen.getByRole('status');
  expect(status).toBeEmptyDOMElement();
  fireEvent.click(rowButton('Cara'));
  expect(status).toHaveTextContent('2 selected');
  fireEvent.click(selectPage());
  expect(status).toHaveTextContent('3 selected');
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(status).toHaveTextContent('0 selected');
});

it('translates the selection strings', () => {
  render(
    <Sample
      selectionMode="multiple"
      defaultSelectedKeys={['1']}
      labels={{
        selection: 'Auswahl',
        selectPage: 'Seite wählen',
        clearSelection: 'Leeren',
        selectedCount: '{count} gewählt',
        selectRow: 'Wähle',
      }}
    />,
  );
  expect(screen.getByRole('group', { name: 'Auswahl' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Seite wählen' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Leeren' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Wähle Cara' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Wähle Ada' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 gewählt');
});

it('gives skeleton rows no button', () => {
  render(<Sample rows={[]} loading selectionMode="multiple" />);
  expect(screen.queryByRole('button', { name: /^Select (?!page)/ })).toBeNull();
});

it('warns once per column about a link or button in the rowHeader cell', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  vi.spyOn(console, 'error').mockImplementation(vi.fn());
  render(
    <Sample
      selectionMode="single"
      columns={[
        {
          id: 'linked',
          header: 'Name',
          cell: (p) => <a href="#x">{p.name}</a>,
          rowHeader: true,
        },
      ]}
    />,
  );
  const calls = warn.mock.calls.filter((c) =>
    /DataTable.*rowHeader.*link or button/s.test(String(c[0])),
  );
  expect(calls).toHaveLength(1);
});

it('does not warn about interactive content without selectionMode', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  render(
    <Sample
      columns={[
        {
          id: 'linked-free',
          header: 'Name',
          cell: (p) => <a href="#x">{p.name}</a>,
          rowHeader: true,
        },
      ]}
    />,
  );
  expect(warn).not.toHaveBeenCalled();
});
