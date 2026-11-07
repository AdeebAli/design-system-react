import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  parameters: {
    docs: {
      description: {
        component:
          'Children from top to bottom. Use `Flex` to change direction, and `Inset` to add padding.',
      },
    },
  },
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
