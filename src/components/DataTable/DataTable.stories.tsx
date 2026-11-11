import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from '../Table';
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from './DataTable';

interface Customer {
  id: string;
  name: string;
  plan: string;
  spend: number | null;
}

const customers: Customer[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1),
  name:
    ['Ada', 'Bo', 'Cara', 'Dev', 'Eli', 'Fay'][index % 6]! + ` ${index + 1}`,
  plan: ['Free', 'Pro', 'Team'][index % 3]!,
  spend: index % 7 === 0 ? null : (index * 37) % 200,
}));

const columns: DataTableColumn<Customer>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (c) => c.name,
    sortValue: (c) => c.name,
    rowHeader: true,
  },
  { id: 'plan', header: 'Plan', cell: (c) => c.plan },
  {
    id: 'spend',
    header: 'Spend',
    cell: (c) => (c.spend === null ? '-' : c.spend.toFixed(2)),
    sortValue: (c) => c.spend,
    align: 'end',
  },
];

const meta: Meta<typeof DataTable<Customer>> = {
  title: 'Components/DataTable',
  component: DataTable,
  args: {
    'aria-label': 'Customers',
    rows: customers,
    columns,
    getRowId: (c: Customer) => c.id,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A table that manages its own sorting, pagination, selection, and loading and empty states. A sortable header cycles ascending, descending, unsorted; `null` sorts last. With `selectionMode`, the row header becomes a toggle button and a click anywhere on a row toggles it. Use `Table` for display and server rendering.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<Customer>>;

export const Sortable: Story = {
  args: { pageSize: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Name/ }));
    await expect(
      canvas.getByRole('columnheader', { name: /Name/ }),
    ).toHaveAttribute('aria-sort', 'ascending');
  },
};

export const Loading: Story = { args: { rows: [], loading: true } };

export const LoadingWithRows: Story = { args: { loading: true, pageSize: 10 } };

export const Empty: Story = {
  args: {
    rows: [],
    empty: (
      <EmptyState title="No customers" description="Add one to get started." />
    ),
  },
};

export const StickyHeader: Story = {
  args: { stickyHeader: true, maxHeight: 'screen', scrollable: true },
};

export const Selection: Story = {
  args: { pageSize: 5, selectionMode: 'multiple', disabledKeys: ['2'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    await expect(status).toBeEmptyDOMElement();
    await userEvent.click(canvas.getByRole('button', { name: 'Select Ada 1' }));
    await expect(
      canvas.getByRole('button', { name: 'Select Ada 1' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(status).toHaveTextContent('1 selected');
    await userEvent.click(canvas.getByRole('button', { name: 'Select page' }));
    await expect(
      canvas.getByRole('button', { name: 'Select page' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Select Bo 2' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(status).toHaveTextContent('0 selected');
  },
};

export const SingleSelection: Story = {
  args: { selectionMode: 'single', defaultSelectedKeys: ['3'], pageSize: 5 },
};

export const ClicksOnlyOnTheButton: Story = {
  name: 'Selection without row clicks',
  args: { selectionMode: 'multiple', selectOnRowClick: false, pageSize: 5 },
};

function FullPageDemo() {
  const [rows, setRows] = useState(customers);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLoading(!loading)}
        >
          {loading ? 'Stop loading' : 'Load'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRows(rows.length > 0 ? [] : customers)}
        >
          {rows.length > 0 ? 'Remove rows' : 'Restore rows'}
        </Button>
      </div>
      <DataTable
        aria-label="Customers"
        columns={columns}
        getRowId={(c) => c.id}
        rows={rows}
        loading={loading}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        pageSize={10}
        defaultSort={{ column: 'spend', direction: 'descending' }}
        stickyHeader
        maxHeight="screen"
        scrollable
        empty={
          <EmptyState
            title="No customers"
            description="Add one to get started."
          />
        }
      />
    </div>
  );
}

/** Sorting, selection, pagination, loading, and empty, together. */
export const FullPage: Story = {
  render: () => <FullPageDemo />,
};

const recipe = `import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from '@adeebali/design-system-react';

function CustomersTable({ data, columns }: { data: Customer[]; columns: ColumnDef<Customer>[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table aria-label="Customers">
      <TableHead>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const content = flexRender(header.column.columnDef.header, header.getContext());
              const direction = header.column.getIsSorted();
              return header.column.getCanSort() ? (
                <TableSortHeader
                  key={header.id}
                  direction={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                  onSort={header.column.getToggleSortingHandler()!}
                >
                  {content}
                </TableSortHeader>
              ) : (
                <TableHeader key={header.id}>{content}</TableHeader>
              );
            })}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          // \`selected\` is the style only: give the project's own control the state.
          <TableRow key={row.id} selected={row.getIsSelected()}>
            {row.getVisibleCells().map((cell, index) =>
              index === 0 ? (
                <TableHeader key={cell.id} scope="row">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableHeader>
              ) : (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ),
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`;

function RecipeDemo() {
  const [sort, setSort] = useState<DataTableSort>(null);
  const shown = customers.slice(0, 6);
  const ordered = [...shown].sort((a, b) => {
    if (!sort) return 0;
    const d = sort.direction === 'ascending' ? 1 : -1;
    return d * a.name.localeCompare(b.name);
  });
  const next = (): DataTableSort =>
    sort === null
      ? { column: 'name', direction: 'ascending' }
      : sort.direction === 'ascending'
        ? { column: 'name', direction: 'descending' }
        : null;
  return (
    <Table aria-label="Customers, composed from the parts">
      <TableHead>
        <TableRow>
          <TableSortHeader
            direction={sort?.direction ?? 'none'}
            onSort={() => setSort(next())}
          >
            Name
          </TableSortHeader>
          <TableHeader>Plan</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ordered.map((c) => (
          <TableRow key={c.id}>
            <TableHeader scope="row">{c.name}</TableHeader>
            <TableCell>{c.plan}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * For filtering, virtualization, editing, or column resizing, use the `Table`
 * parts with a library such as TanStack Table. This story shows the same
 * result built by hand with the parts; the code below wires them to
 * TanStack Table. This package doesn't depend on it, so install it yourself.
 */
export const TanStackRecipe: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Use the `Table` parts when you need filtering, virtualization, editing, or column resizing. They carry the styles; the library carries the state. This package doesn't depend on TanStack Table, so install it yourself.",
          '',
          '```tsx',
          recipe,
          '```',
        ].join('\n'),
      },
    },
  },
  render: () => <RecipeDemo />,
};
