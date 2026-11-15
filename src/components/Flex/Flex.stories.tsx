import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';
import { Flex } from './Flex';

const meta: Meta<typeof Flex> = {
  title: 'Components/Layout/Flex',
  component: Flex,
};

export default meta;
type Story = StoryObj<typeof Flex>;

export const Playground: Story = {
  args: {
    gap: '2',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: 'column',
    gap: '2',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const AlignAndJustify: Story = {
  args: {
    align: 'center',
    justify: 'between',
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
    direction: { base: 'column', md: 'row' },
    gap: { base: '2', md: '6' },
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};
