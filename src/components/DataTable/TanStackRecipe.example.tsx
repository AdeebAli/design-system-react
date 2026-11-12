// For @tanstack/react-table v9 (checked against 9.3.1). In a project, import
// the parts from '@adeebali/design-system-react'.
import {
  createColumnHelper,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from '../Table';

interface Customer {
  id: string;
  name: string;
  plan: string;
}

const data: Customer[] = [
  { id: '1', name: 'Ada Lovelace', plan: 'Pro' },
  { id: '2', name: 'Grace Hopper', plan: 'Team' },
  { id: '3', name: 'Alan Turing', plan: 'Free' },
  { id: '4', name: 'Katherine Johnson', plan: 'Pro' },
  { id: '5', name: 'Edsger Dijkstra', plan: 'Team' },
  { id: '6', name: 'Barbara Liskov', plan: 'Free' },
];

// Defined once, outside the component, as TanStack recommends.
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

const column = createColumnHelper<typeof features, Customer>();
const columns = column.columns([
  column.accessor('name', { header: 'Name', sortFn: 'alphanumeric' }),
  column.accessor('plan', { header: 'Plan', enableSorting: false }),
]);

const sortDirection = (sorted: false | 'asc' | 'desc') =>
  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';

export default function CustomersTable() {
  const table = useTable({ features, columns, data });

  return (
    <Table aria-label="Customers">
      <TableHead>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const content = flexRender(
                header.column.columnDef.header,
                header.getContext(),
              );
              return header.column.getCanSort() ? (
                <TableSortHeader
                  key={header.id}
                  direction={sortDirection(header.column.getIsSorted())}
                  onSort={() => header.column.toggleSorting()}
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
          <TableRow key={row.id}>
            {row.getAllCells().map((cell, index) => {
              const content = flexRender(
                cell.column.columnDef.cell,
                cell.getContext(),
              );
              return index === 0 ? (
                <TableHeader key={cell.id} scope="row">
                  {content}
                </TableHeader>
              ) : (
                <TableCell key={cell.id}>{content}</TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
