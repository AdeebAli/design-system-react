import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { DataTable, type DataTableColumn } from './DataTable';
import CustomersTable from './TanStackRecipe.example';
import recipeSource from './TanStackRecipe.example.tsx?raw';

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
  title: 'Components/Data/DataTable',
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
    await expect(status).toHaveTextContent('0 selected');
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

/**
 * For filtering, virtualization, editing, or column resizing, use the `Table`
 * parts with a library such as TanStack Table. This story renders the recipe
 * file itself, which `npm run typecheck` covers, so it can't drift from v9.
 */
export const TanStackRecipe: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Use the `Table` parts when you need filtering, virtualization, editing, or column resizing. They carry the styles; the library carries the state. This package doesn't depend on TanStack Table, so install it yourself: `npm i @tanstack/react-table`. The code below is for v9.",
          '',
          '```tsx',
          recipeSource
            .replace("from '../Table'", "from '@adeebali/design-system-react'")
            .trimEnd(),
          '```',
        ].join('\n'),
      },
    },
  },
  render: () => <CustomersTable />,
  // The recipe really sorts: TanStack Table v9 drives the parts.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRowHeader = () => canvas.getAllByRole('rowheader')[0];
    await expect(firstRowHeader()).toHaveTextContent('Ada Lovelace');
    await userEvent.click(canvas.getByRole('button', { name: /Name/ }));
    await expect(
      canvas.getByRole('columnheader', { name: /Name/ }),
    ).toHaveAttribute('aria-sort', 'ascending');
    // Unsorted, the second row is Grace Hopper.
    await expect(canvas.getAllByRole('rowheader')[1]).toHaveTextContent(
      'Alan Turing',
    );
    await userEvent.click(canvas.getByRole('button', { name: /Name/ }));
    await expect(
      canvas.getByRole('columnheader', { name: /Name/ }),
    ).toHaveAttribute('aria-sort', 'descending');
    await expect(firstRowHeader()).toHaveTextContent('Katherine Johnson');
  },
};
