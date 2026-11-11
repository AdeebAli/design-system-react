import {
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from '@adeebali/design-system-react';
import NextLink from '../NextLink';
import { CustomersTable } from '../CustomersTable';

const people = [
  ['Ada Park', 'Pro'],
  ['Grace Lin', 'Team'],
  ['Alan Cho', 'Free'],
  ['Bea Ito', 'Pro'],
  ['Eli Moss', 'Team'],
  ['Fay Roe', 'Free'],
  ['Gus Tan', 'Pro'],
  ['Hal Voss', 'Team'],
] as const;
const PER_PAGE = 4;
const totalPages = Math.ceil(people.length / PER_PAGE);

// A server page: a Table and a Pagination of next/link links need no client
// code, and a DataTable beside them hydrates (Spec 13).
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requested = Number((await searchParams).page);
  const page =
    Number.isInteger(requested) && requested >= 1 && requested <= totalPages
      ? requested
      : 1;
  const rows = people.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return (
    <Stack gap="6">
      <Stack gap="3">
        <Table aria-label="Plans">
          <TableHead>
            <TableRow>
              <TableSortHeader
                as={NextLink}
                href="/data?page=1"
                direction="none"
              >
                Name
              </TableSortHeader>
              <TableHeader>Plan</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([name, plan]) => (
              <TableRow key={name}>
                <TableHeader scope="row">{name}</TableHeader>
                <TableCell>{plan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          totalPages={totalPages}
          getHref={(next) => `/data?page=${next}`}
          as={NextLink}
        />
      </Stack>
      <CustomersTable />
    </Stack>
  );
}
