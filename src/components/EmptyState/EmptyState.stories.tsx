import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../Button';
import { Card } from '../Card';
import { Icon } from '../Icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table';
import { EmptyState } from './EmptyState';

const Search = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Data/EmptyState',
  component: EmptyState,
  args: {
    title: 'No results',
    description: 'Try a different search.',
    icon: <Icon icon={Search} size="lg" tone="muted" />,
    action: <Button variant="soft">Clear filters</Button>,
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 3,
        name: 'No results',
      }),
    ).toBeInTheDocument();
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const TitleOnly: Story = {
  args: { description: undefined, icon: undefined, action: undefined },
};

export const InCard: Story = {
  render: (args) => (
    <Card>
      <EmptyState {...args} />
    </Card>
  ),
};

export const InTable: Story = {
  render: (args) => (
    <Table aria-label="Customers">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Plan</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow hoverable={false}>
          <TableCell colSpan={3}>
            <EmptyState {...args} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
