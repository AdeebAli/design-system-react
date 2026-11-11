import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EmptyState } from '../EmptyState';
import { DataTable, type DataTableColumn } from './DataTable';

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
          'A table that manages its own sorting, pagination, and loading and empty states. A sortable header cycles ascending, descending, unsorted; `null` sorts last. Use `Table` for display and server rendering.',
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
