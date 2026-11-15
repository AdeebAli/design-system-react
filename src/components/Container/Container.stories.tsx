import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Components/Layout/Container',
  component: Container,
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Playground: Story = {
  args: { children: <Tile>Content</Tile> },
};

export const Small: Story = {
  args: { size: 'sm', children: <Tile>sm</Tile> },
};

export const Prose: Story = {
  args: { size: 'prose', children: <Tile>prose</Tile> },
};

export const Full: Story = {
  args: { size: 'full', children: <Tile>full</Tile> },
};

export const NoPadding: Story = {
  args: { paddingX: '0', children: <Tile>No side padding</Tile> },
};
