import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './Button';
import { Container } from './Container';
import { DataTable, type DataTableColumn } from './DataTable';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';
import { Inline } from './Inline';
import { Stack } from './Stack';

const meta: Meta = {
  title: 'Patterns/Data',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A customers table with sorting, selection, pagination, and loading and empty states, built from `DataTable`, `EmptyState`, and `Skeleton`, with no `style` or `className`. Use `Table` and `Pagination` directly when the data comes from a server or you need to render on the server.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

interface Customer {
  id: string;
  name: string;
  plan: string;
  spend: number | null;
}

const customers: Customer[] = Array.from({ length: 27 }, (_, index) => ({
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
    cell: (customer) => customer.name,
    sortValue: (customer) => customer.name,
    rowHeader: true,
  },
  { id: 'plan', header: 'Plan', cell: (customer) => customer.plan },
  {
    id: 'spend',
    header: 'Spend',
    cell: (customer) =>
      customer.spend === null ? '-' : customer.spend.toFixed(2),
    sortValue: (customer) => customer.spend,
    align: 'end',
  },
];

function CustomersPage() {
  const [rows, setRows] = useState(customers);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Container size="lg" marginY="4">
      <Stack gap="4">
        <Inline gap="2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(!loading)}
          >
            {loading ? 'Stop loading' : 'Show loading'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows(rows.length > 0 ? [] : customers)}
          >
            {rows.length > 0 ? 'Remove rows' : 'Restore rows'}
          </Button>
        </Inline>
        <DataTable
          aria-label="Customers"
          columns={columns}
          getRowId={(customer) => customer.id}
          rows={rows}
          loading={loading}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          pageSize={10}
          defaultSort={{ column: 'spend', direction: 'descending' }}
          empty={
            <EmptyState
              icon={<Icon icon={Inbox} size="lg" tone="muted" />}
              title="No customers"
              description="Add one to get started."
              action={<Button>Add customer</Button>}
            />
          }
        />
      </Stack>
    </Container>
  );
}

export const CustomersTable: Story = {
  render: () => <CustomersPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('columnheader', { name: /Spend/ }),
    ).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(canvas.getByRole('button', { name: /Name/ }));
    await expect(
      canvas.getByRole('columnheader', { name: /Name/ }),
    ).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(canvas.getByRole('button', { name: 'Select Ada 1' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('1 selected');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove rows' }));
    await expect(canvas.getByText('No customers')).toBeVisible();
  },
};
