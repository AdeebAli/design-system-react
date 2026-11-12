'use client';

import { DataTable, type DataTableColumn } from '@adeebali/design-system-react';

interface Customer {
  id: string;
  name: string;
  plan: string;
  spend: number;
}

const customers: Customer[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: `Customer ${index + 1}`,
  plan: ['Free', 'Pro', 'Team'][index % 3]!,
  spend: (index * 37) % 200,
}));

// `columns` holds functions, so it's defined in client code (Spec 13).
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
    cell: (customer) => customer.spend.toFixed(2),
    sortValue: (customer) => customer.spend,
    align: 'end',
  },
];

export function CustomersTable() {
  return (
    <DataTable
      aria-label="Customers"
      columns={columns}
      rows={customers}
      getRowId={(customer) => customer.id}
      selectionMode="multiple"
      defaultSort={{ column: 'spend', direction: 'descending' }}
      pageSize={5}
    />
  );
}
