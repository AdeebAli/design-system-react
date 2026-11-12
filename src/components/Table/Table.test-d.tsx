import {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
  type TableBodyProps,
  type TableFootProps,
  type TableHeadProps,
} from './index';

const noop = () => undefined;

test('TableSortHeader needs a direction and exactly one of onSort or href', () => {
  <TableSortHeader direction="none" onSort={noop} />;
  <TableSortHeader direction="ascending" href="?sort=a" />;
  <TableSortHeader direction="none" href="/a" as="a" />;
  // @ts-expect-error direction is required
  <TableSortHeader onSort={noop} />;
  // @ts-expect-error onSort and href are exclusive
  <TableSortHeader direction="none" onSort={noop} href="/a" />;
  // @ts-expect-error an action is required
  <TableSortHeader direction="none" />;
  // @ts-expect-error as needs href
  <TableSortHeader direction="none" onSort={noop} as="a" />;
  // @ts-expect-error direction is one of three values
  <TableSortHeader direction="up" onSort={noop} />;
});

test('Table props', () => {
  <Table
    aria-label="t"
    size="sm"
    stickyBackground="canvas"
    maxHeight="screen"
  />;
  // @ts-expect-error size is sm or md
  <Table size="lg" />;
  // @ts-expect-error stickyBackground is a surface
  <Table stickyBackground="accent" />;
  <TableRow selected hoverable={false} />;
  <TableRow spanned />;
  // @ts-expect-error spanned is a boolean
  <TableRow spanned="yes" />;
  <TableHeader scope="row" align="end" />;
  // @ts-expect-error scope is col or row
  <TableHeader scope="colgroup" />;
  <TableCell align="center" colSpan={2} />;
  // @ts-expect-error align is start, center, or end
  <TableCell align="left" />;
});

test('the section props types are exported', () => {
  const head: TableHeadProps = { className: 'a' };
  const body: TableBodyProps = { className: 'a' };
  const foot: TableFootProps = { className: 'a' };
  <>
    <TableHead {...head} />
    <TableBody {...body} />
    <TableFoot {...foot} />
  </>;
});
