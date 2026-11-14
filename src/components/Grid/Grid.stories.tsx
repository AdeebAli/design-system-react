import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Components/Layout/Grid',
  component: Grid,
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Playground: Story = {
  args: {
    columns: '3',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const Responsive: Story = {
  args: {
    columns: { base: '2', md: '4' },
    children: (
      <>
        <Tile gridColumn="span-2">Wide</Tile>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const EqualRows: Story = {
  args: {
    columns: '2',
    autoRows: 'equal',
    children: (
      <>
        <Tile>Short</Tile>
        <Tile>
          Taller, because this text runs on for long enough to wrap onto several
          lines at this width.
        </Tile>
        <Tile>This row matches the tallest one</Tile>
      </>
    ),
  },
};
