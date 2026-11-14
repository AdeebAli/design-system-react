import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Inset } from './Inset';

const meta: Meta<typeof Inset> = {
  title: 'Components/Layout/Inset',
  component: Inset,
};

export default meta;
type Story = StoryObj<typeof Inset>;

export const Playground: Story = {
  args: { space: '4', children: <Tile>Content</Tile> },
};

export const Sides: Story = {
  args: { x: '8', y: '2', children: <Tile>x and y</Tile> },
};

export const OneSide: Story = {
  args: { start: '12', children: <Tile>start</Tile> },
};

export const Responsive: Story = {
  args: { space: { base: '2', md: '8' }, children: <Tile>Responsive</Tile> },
};
