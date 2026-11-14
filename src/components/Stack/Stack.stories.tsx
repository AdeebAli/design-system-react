import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Components/Layout/Stack',
  component: Stack,
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Playground: Story = {
  args: {
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const Gap: Story = {
  args: {
    gap: '8',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const Aligned: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const HiddenOnSmallScreens: Story = {
  decorators: [
    (Story) => (
      <>
        <p>The stack below appears from the md breakpoint up.</p>
        <Story />
      </>
    ),
  ],
  args: {
    display: { base: 'none', md: 'flex' },
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};
