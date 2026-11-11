import { render, screen } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { page, userEvent } from 'vitest/browser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
  type TableProps,
} from '../Table';
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from './DataTable';

interface Person {
  id: string;
  name: string;
  plan: string;
  spend: number;
}

const people: Person[] = [
  { id: '1', name: 'Ada Park', plan: 'Pro', spend: 120 },
  { id: '2', name: 'Bo Chen', plan: 'Free', spend: 0 },
  { id: '3', name: 'Cara Diaz', plan: 'Team', spend: 340.5 },
  { id: '4', name: 'Dev Rao', plan: 'Pro', spend: 88 },
];

const columns: DataTableColumn<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (p) => p.name,
    sortValue: (p) => p.name,
    rowHeader: true,
  },
  { id: 'plan', header: 'Plan', cell: (p) => p.plan },
  {
    id: 'spend',
    header: 'Spend',
    cell: (p) => p.spend.toFixed(2),
    align: 'end',
  },
];

const noop = () => undefined;
const pressed = (name: string) =>
  screen.getByRole('button', { name: `Select ${name}` }).ariaPressed;
const rowButton = (name: string) =>
  screen.getByRole('button', { name: `Select ${name}` });
const cellOf = (row: string, column: number) =>
  rowButton(row).closest('tr')!.children[column] as HTMLElement;

type Extra = Partial<DataTableProps<Person>>;

/** Keeps the selection in state and reports each change. */
function Host({
  onChange = noop,
  children,
  ...props
}: Extra & { onChange?: (keys: string[]) => void; children?: ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);
  const all = {
    'aria-label': 'People',
    rows: people,
    columns,
    getRowId: (p: Person) => p.id,
    selectionMode: 'multiple',
    selectedKeys: keys,
    onSelectionChange: (next: string[]) => {
      setKeys(next);
      onChange(next);
    },
    ...props,
  };
  return (
    <>
      {children}
      <DataTable {...(all as unknown as DataTableProps<Person>)} />
    </>
  );
}

beforeEach(async () => {
  await page.viewport(800, 600);
});

it('Space and Enter toggle the row button', async () => {
  render(<Host />);
  rowButton('Ada Park').focus();
  await userEvent.keyboard(' ');
  expect(pressed('Ada Park')).toBe('true');
  await userEvent.keyboard('{Enter}');
  expect(pressed('Ada Park')).toBe('false');
});

it('Tab moves from one row button to the next', async () => {
  render(<Host />);
  rowButton('Ada Park').focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(rowButton('Bo Chen'));
});

it('a row click toggles once, on a cell and on the button', async () => {
  const onChange = vi.fn();
  render(<Host onChange={onChange} />);
  await userEvent.click(cellOf('Bo Chen', 1));
  expect(pressed('Bo Chen')).toBe('true');
  expect(onChange).toHaveBeenCalledTimes(1);
  await userEvent.click(rowButton('Bo Chen'));
  expect(pressed('Bo Chen')).toBe('false');
  expect(onChange).toHaveBeenCalledTimes(2);
});

it('a row click does nothing with selectOnRowClick off, but the button still works', async () => {
  const onChange = vi.fn();
  render(<Host onChange={onChange} selectOnRowClick={false} />);
  await userEvent.click(cellOf('Bo Chen', 1));
  expect(onChange).not.toHaveBeenCalled();
  expect(getComputedStyle(cellOf('Bo Chen', 1).parentElement!).cursor).not.toBe(
    'pointer',
  );
  await userEvent.click(rowButton('Bo Chen'));
  expect(pressed('Bo Chen')).toBe('true');
});

it('shows a pointer cursor on a clickable row only', () => {
  render(<Host disabledKeys={['2']} />);
  const cursor = (name: string) =>
    getComputedStyle(cellOf(name, 1).parentElement!).cursor;
  expect(cursor('Ada Park')).toBe('pointer');
  expect(cursor('Bo Chen')).not.toBe('pointer');
});

it('a disabled row ignores clicks on the row and the button', async () => {
  const onChange = vi.fn();
  render(<Host onChange={onChange} disabledKeys={['2']} />);
  await userEvent.click(cellOf('Bo Chen', 1));
  await userEvent.click(rowButton('Bo Chen'), { force: true });
  expect(onChange).not.toHaveBeenCalled();
  expect(rowButton('Bo Chen')).toBeDisabled();
});

it('a link or control in a cell does not toggle the row', async () => {
  const onChange = vi.fn();
  const cols: DataTableColumn<Person>[] = [
    ...columns,
    {
      id: 'actions',
      header: 'Actions',
      cell: (p) => (
        <>
          <a href="#details" data-testid={`link-${p.id}`}>
            Details
          </a>{' '}
          <button type="button" data-testid={`btn-${p.id}`}>
            More
          </button>{' '}
          <input aria-label={`Note ${p.id}`} />
        </>
      ),
    },
  ];
  render(<Host onChange={onChange} columns={cols} />);
  await userEvent.click(screen.getByTestId('link-1'));
  await userEvent.click(screen.getByTestId('btn-1'));
  await userEvent.click(screen.getByLabelText('Note 1'));
  expect(onChange).not.toHaveBeenCalled();
});

it('a click that ends a text selection does not toggle the row', () => {
  const onChange = vi.fn();
  render(<Host onChange={onChange} />);
  const cell = cellOf('Bo Chen', 1);
  const selection = window.getSelection()!;
  selection.selectAllChildren(cell);
  expect(selection.toString()).not.toBe('');
  cell.click();
  expect(onChange).not.toHaveBeenCalled();
  selection.removeAllRanges();
  cell.click();
  expect(onChange).toHaveBeenCalledTimes(1);
});

it.each(['md', 'sm'] as const)(
  'the row button is at least 24px tall at size %s',
  (size) => {
    render(<Host size={size} />);
    for (const row of people) {
      expect(
        rowButton(row.name).getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(24);
    }
  },
);

it('underlines the row button dotted, and solid on hover', async () => {
  render(<Host />);
  const style = () => getComputedStyle(rowButton('Ada Park'));
  expect(style().textDecorationLine).toBe('underline');
  expect(style().textDecorationStyle).toBe('dotted');
  await userEvent.hover(rowButton('Ada Park'));
  expect(style().textDecorationStyle).toBe('solid');
});

it('Select page moves through mixed and true in the browser', async () => {
  render(<Host disabledKeys={['2']} />);
  const toggle = () => screen.getByRole('button', { name: 'Select page' });
  await userEvent.click(rowButton('Ada Park'));
  expect(toggle().ariaPressed).toBe('mixed');
  await userEvent.click(toggle());
  expect(toggle().ariaPressed).toBe('true');
  expect(pressed('Bo Chen')).toBe('false');
});

// DataTable matches an equivalent Table: the same cell rects and computed colors.

const COLOR_PROPS = [
  'backgroundColor',
  'color',
  'borderTopColor',
  'borderBottomColor',
  'borderInlineEndColor',
  'fontSize',
  'fontWeight',
  'textAlign',
  'position',
] as const;

interface CellSnapshot {
  rect: [number, number, number, number];
  styles: string[];
  bar: string[];
}

function snapshot(root: Element): CellSnapshot[] {
  const table = root.querySelector('table')!;
  const origin = table.getBoundingClientRect();
  return [...table.querySelectorAll('th, td')].map((cell) => {
    const rect = cell.getBoundingClientRect();
    const css = getComputedStyle(cell);
    const bar = getComputedStyle(cell, '::before');
    return {
      rect: [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height].map(
        (n) => Math.round(n * 100) / 100,
      ) as CellSnapshot['rect'],
      styles: COLOR_PROPS.map((p) => css[p]),
      bar: [bar.content, bar.backgroundColor, bar.width],
    };
  });
}

function EquivalentTable({
  selectedId,
  ...props
}: TableProps & { selectedId?: string }) {
  return (
    <Table aria-label="People" {...props}>
      <TableHead>
        <TableRow>
          <TableSortHeader direction="none" onSort={noop}>
            Name
          </TableSortHeader>
          <TableHeader>Plan</TableHeader>
          <TableHeader align="end">Spend</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {people.map((p) => (
          <TableRow key={p.id} selected={p.id === selectedId}>
            <TableHeader scope="row">{p.name}</TableHeader>
            <TableCell>{p.plan}</TableCell>
            <TableCell align="end">{p.spend.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type Config = [
  name: string,
  props: Extra & TableProps,
  box: { width: number; height?: number },
];

const configs: Config[] = [
  ['md', { size: 'md' }, { width: 600 }],
  ['sm', { size: 'sm' }, { width: 600 }],
  [
    'stickyHeader with maxHeight',
    { stickyHeader: true, maxHeight: 'full' },
    { width: 600, height: 120 },
  ],
  [
    'stickyFirstColumn in a narrow box',
    { stickyFirstColumn: true },
    { width: 240 },
  ],
  [
    'stickyBackground raised with both sticky props',
    {
      stickyBackground: 'raised',
      stickyHeader: true,
      stickyFirstColumn: true,
      maxHeight: 'full',
    },
    { width: 240, height: 120 },
  ],
  ['hoverable off, sm', { hoverable: false, size: 'sm' }, { width: 600 }],
];

it.each(configs)(
  'matches an equivalent Table without selection: %s',
  (_name, props, box) => {
    const { container } = render(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div
          data-testid="data"
          style={{ width: box.width, height: box.height }}
        >
          <DataTable
            aria-label="People"
            rows={people}
            columns={columns}
            getRowId={(p) => p.id}
            {...(props as object)}
          />
        </div>
        <div
          data-testid="table"
          style={{ width: box.width, height: box.height }}
        >
          <EquivalentTable {...props} />
        </div>
      </div>,
    );
    const data = snapshot(container.querySelector('[data-testid=data]')!);
    const table = snapshot(container.querySelector('[data-testid=table]')!);
    expect(data).toHaveLength(15);
    expect(data).toEqual(table);
  },
);

function renderPair(size: 'md' | 'sm', selected: boolean) {
  const { container } = render(
    <div style={{ width: 600 }}>
      <div data-testid="data">
        <DataTable
          aria-label="People"
          rows={people}
          columns={columns}
          getRowId={(p) => p.id}
          selectionMode="single"
          defaultSelectedKeys={selected ? ['3'] : []}
          size={size}
        />
      </div>
      <div data-testid="table">
        <EquivalentTable size={size} selectedId={selected ? '3' : undefined} />
      </div>
    </div>,
  );
  return [
    snapshot(container.querySelector('[data-testid=data]')!),
    snapshot(container.querySelector('[data-testid=table]')!),
  ] as const;
}

it.each([['md' as const], ['sm' as const]])(
  'matches an equivalent Table with selection on and nothing selected, at size %s',
  (size) => {
    const [data, table] = renderPair(size, false);
    expect(data).toHaveLength(15);
    expect(data).toEqual(table);
  },
);

// The check icon widens the selected row's header, so the column is wider
// than in the Table, which has no icon. Colors and the bar still match.
it.each([['md' as const], ['sm' as const]])(
  'matches an equivalent Table in colors and the selected bar with a selected row, at size %s',
  (size) => {
    const [data, table] = renderPair(size, true);
    expect(data).toHaveLength(15);
    expect(data.map((c) => [c.styles, c.bar])).toEqual(
      table.map((c) => [c.styles, c.bar]),
    );
    // Row heights and tops match too: the icon doesn't make rows taller.
    expect(data.map((c) => [c.rect[1], c.rect[3]])).toEqual(
      table.map((c) => [c.rect[1], c.rect[3]]),
    );
    expect(data[3 + 2 * 3]!.bar[0]).toBe('""');
  },
);

it("names each row button 'Select' then the text in the real accessibility tree, with the visible text inside the name", async () => {
  render(<Host />);
  await expect
    .element(page.getByRole('button', { name: 'Select Ada Park', exact: true }))
    .toBeVisible();
  await expect
    .element(
      page.getByRole('button', { name: 'Select Cara Diaz', exact: true }),
    )
    .toBeVisible();
});
