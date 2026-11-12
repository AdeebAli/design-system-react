import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Card } from '../Card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
  type TableSortDirection,
} from './index';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  args: { 'aria-label': 'Customers' },
  parameters: {
    docs: {
      description: {
        component:
          'Styled, semantic table parts. They hold no state, so sorting, paging, and selection stay in your own state. Pass header text in normal case, since CSS does the uppercase. `stickyHeader` sticks to the wrapper, so give the table a height limit such as `maxHeight="screen"`. A sticky first column has a fixed width (half of `size.dialog.sm`, 12rem in Soft), and its text wraps inside it, so a focused cell is never hidden under it. Do not set a width on its cells, since the scroll reserve assumes the fixed width. When a first-column cell spans rows (`rowSpan`), mark the rows it covers with `spanned` on `TableRow`. The selected bar of a covered row then scrolls under the sticky spanning cell when the table is scrolled sideways, and the spanning cell takes only the hover and selected color of its own row. Only a one-row header sticks; a header with two or more rows scrolls with the table. Only one `TableSortHeader` should be sorted at a time. `onSort` needs a client component, and `href` works from a server one.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const ROWS = [
  ['Ada Park', 'Pro', '1,240'],
  ['Grace Lin', 'Team', '860'],
  ['Alan Cho', 'Free', '0'],
];

function Rows({ selected }: { selected?: string }) {
  return (
    <TableBody>
      {ROWS.map(([name, plan, spend]) => (
        <TableRow key={name} selected={name === selected}>
          <TableHeader scope="row">{name}</TableHeader>
          <TableCell>{plan}</TableCell>
          <TableCell align="end">{spend}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export const Playground: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Plan</TableHeader>
          <TableHeader align="end">Spend</TableHeader>
        </TableRow>
      </TableHead>
      <Rows selected="Grace Lin" />
      <TableFoot>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell align="end">2,100</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ),
};

export const Small: Story = {
  args: { size: 'sm' },
  render: Playground.render,
};

export const WithCaption: Story = {
  render: (args) => (
    <Table {...args} aria-label={undefined}>
      <TableCaption>Customers by spend</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Plan</TableHeader>
          <TableHeader align="end">Spend</TableHeader>
        </TableRow>
      </TableHead>
      <Rows />
    </Table>
  ),
};

function Sortable() {
  const [sort, setSort] = useState<{
    by: string;
    direction: TableSortDirection;
  }>({
    by: 'name',
    direction: 'ascending',
  });
  const direction = (by: string): TableSortDirection =>
    sort.by === by ? sort.direction : 'none';
  const toggle = (by: string) =>
    setSort({
      by,
      direction:
        sort.by === by && sort.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  return (
    <Table aria-label="Customers" scrollable>
      <TableHead>
        <TableRow>
          <TableSortHeader
            direction={direction('name')}
            onSort={() => toggle('name')}
          >
            Name
          </TableSortHeader>
          <TableHeader>Plan</TableHeader>
          <TableSortHeader
            align="end"
            direction={direction('spend')}
            onSort={() => toggle('spend')}
          >
            Spend
          </TableSortHeader>
        </TableRow>
      </TableHead>
      <Rows />
    </Table>
  );
}

export const Sorting: Story = {
  render: () => <Sortable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('columnheader', { name: 'Name' });
    await expect(name).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(canvas.getByRole('button', { name: 'Spend' }));
    await expect(
      canvas.getByRole('columnheader', { name: 'Spend' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    await expect(name).not.toHaveAttribute('aria-sort');
  },
};

export const SortLinks: Story = {
  render: () => (
    <Table aria-label="Customers">
      <TableHead>
        <TableRow>
          <TableSortHeader direction="descending" href="?sort=name">
            Name
          </TableSortHeader>
          <TableHeader>Plan</TableHeader>
          <TableSortHeader align="end" direction="none" href="?sort=spend">
            Spend
          </TableSortHeader>
        </TableRow>
      </TableHead>
      <Rows />
    </Table>
  ),
};

export const InsideCard: Story = {
  render: () => (
    <Card padding="none" clip>
      <Table aria-label="Customers" scrollable>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Plan</TableHeader>
            <TableHeader align="end">Spend</TableHeader>
          </TableRow>
        </TableHead>
        <Rows />
      </Table>
    </Card>
  ),
};

const noop = () => undefined;
const MONTHS = Array.from({ length: 12 }, (_, m) => `Month ${m + 1}`);

function Wide(props: Partial<React.ComponentProps<typeof Table>>) {
  return (
    <div style={{ height: 280, width: 480 }}>
      <Table aria-label="Spend by month" maxHeight="full" scrollable {...props}>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            {MONTHS.map((month) => (
              <TableHeader key={month} align="end">
                {month}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 20 }, (_, r) => (
            <TableRow key={r} selected={r === 2}>
              <TableHeader scope="row">{`Customer ${r + 1}`}</TableHeader>
              {MONTHS.map((month, m) => (
                <TableCell key={month} align="end">
                  {(r + 1) * (m + 3) * 11}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const StickyHeader: Story = {
  render: () => <Wide stickyHeader />,
};

export const StickyFirstColumn: Story = {
  render: () => <Wide stickyFirstColumn />,
};

export const StickyHeaderAndColumn: Story = {
  render: () => <Wide stickyHeader stickyFirstColumn />,
};

export const StickyOnCanvas: Story = {
  render: () => (
    <Wide stickyHeader stickyFirstColumn stickyBackground="canvas" />
  ),
};

export const StickySmall: Story = {
  render: () => <Wide size="sm" stickyHeader stickyFirstColumn />,
};

/** A grouped two-row header scrolls with the table: only a one-row header sticks. */
export const StickyTwoRowHeader: Story = {
  render: () => (
    <div style={{ height: 280, width: 480 }}>
      <Table
        aria-label="Spend by half"
        maxHeight="full"
        scrollable
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableHeader rowSpan={2}>Name</TableHeader>
            <TableHeader colSpan={6} align="center">
              First half
            </TableHeader>
            <TableHeader colSpan={6} align="center">
              Second half
            </TableHeader>
          </TableRow>
          <TableRow>
            {MONTHS.map((month) => (
              <TableHeader key={month} align="end">
                {month}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 20 }, (_, r) => (
            <TableRow key={r}>
              <TableHeader scope="row">{`Customer ${r + 1}`}</TableHeader>
              {MONTHS.map((month, m) => (
                <TableCell key={month} align="end">
                  {(r + 1) * (m + 3) * 11}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

const REGIONS = [
  { region: 'Europe', countries: ['France', 'Germany', 'Spain'] },
  { region: 'Asia', countries: ['Japan', 'India'] },
];

/** A first-column cell spans its rows; the rows it covers are marked `spanned`. */
export const StickyWithSpans: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Table aria-label="Spend by country" scrollable stickyFirstColumn>
        <TableHead>
          <TableRow>
            <TableHeader>Region</TableHeader>
            <TableHeader>Country</TableHeader>
            {MONTHS.map((month) => (
              <TableHeader key={month} align="end">
                {month}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {REGIONS.flatMap(({ region, countries }) =>
            countries.map((country, c) => (
              <TableRow key={country} spanned={c > 0}>
                {c === 0 && (
                  <TableHeader scope="row" rowSpan={countries.length}>
                    {region}
                  </TableHeader>
                )}
                <TableHeader scope="row">{country}</TableHeader>
                {MONTHS.map((month, m) => (
                  <TableCell key={month} align="end">
                    {(c + 2) * (m + 3) * 7}
                  </TableCell>
                ))}
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </div>
  ),
};

export const StickySortable: Story = {
  render: () => (
    <div style={{ height: 240, width: 480 }}>
      <Table aria-label="Customers" maxHeight="full" scrollable stickyHeader>
        <TableHead>
          <TableRow>
            <TableSortHeader direction="ascending" onSort={noop}>
              Name
            </TableSortHeader>
            <TableSortHeader direction="none" onSort={noop}>
              Plan
            </TableSortHeader>
            <TableSortHeader align="end" direction="none" onSort={noop}>
              Spend
            </TableSortHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 20 }, (_, r) => (
            <TableRow key={r}>
              <TableHeader scope="row">{`Customer ${r + 1}`}</TableHeader>
              <TableCell>Pro</TableCell>
              <TableCell align="end">{(r + 1) * 120}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};
