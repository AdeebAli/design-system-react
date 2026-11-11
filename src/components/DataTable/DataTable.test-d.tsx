import { DataTable, type DataTableColumn } from './index';

interface Person {
  id: string;
  name: string;
}
const rows: Person[] = [];
const getRowId = (p: Person) => p.id;
const columns: DataTableColumn<Person>[] = [
  { id: 'n', header: 'Name', cell: (p) => p.name, rowHeader: true },
];

test('DataTable props', () => {
  <DataTable
    aria-label="a"
    rows={rows}
    columns={columns}
    getRowId={getRowId}
  />;
  <DataTable
    aria-labelledby="h"
    rows={rows}
    columns={columns}
    getRowId={getRowId}
    pageSize={5}
    totalRows={50}
  />;
  // @ts-expect-error a name is required
  <DataTable rows={rows} columns={columns} getRowId={getRowId} />;
  // @ts-expect-error not both names
  <DataTable
    aria-label="a"
    aria-labelledby="h"
    rows={rows}
    columns={columns}
    getRowId={getRowId}
  />;
  // @ts-expect-error totalRows needs pageSize
  <DataTable
    aria-label="a"
    rows={rows}
    columns={columns}
    getRowId={getRowId}
    totalRows={5}
  />;
});

test('columns', () => {
  <DataTable
    aria-label="a"
    rows={rows}
    getRowId={getRowId}
    columns={[
      {
        id: 'a',
        header: 'A',
        cell: (p) => p.name.toUpperCase(),
        sortValue: (p) => p.name,
      },
      { id: 'b', header: 'B', cell: (p) => p.id, sortable: true },
    ]}
  />;
  <DataTable
    aria-label="a"
    rows={rows}
    getRowId={getRowId}
    columns={[
      // @ts-expect-error sortValue and sortable are exclusive
      {
        id: 'a',
        header: 'A',
        cell: (p) => p.name,
        sortValue: (p: Person) => p.name,
        sortable: true,
      },
    ]}
  />;
  <DataTable
    aria-label="a"
    rows={rows}
    getRowId={getRowId}
    columns={[
      // @ts-expect-error cell's argument is a Person
      { id: 'a', header: 'A', cell: (p) => void p.missing },
    ]}
  />;
});
