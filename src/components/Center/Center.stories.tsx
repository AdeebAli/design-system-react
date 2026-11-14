import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Center } from './Center';

const meta: Meta<typeof Center> = {
  title: 'Components/Layout/Center',
  component: Center,
  parameters: {
    docs: {
      description: {
        component:
          'Centers its children. Giving it a height is up to the caller, because vertical centering has no visible effect otherwise.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Center>;

const child = <Tile>Centered</Tile>;

export const Playground: Story = {
  args: { height: '24', children: child },
};

export const Horizontal: Story = {
  args: { axis: 'horizontal', height: '24', children: child },
};

export const Vertical: Story = {
  args: { axis: 'vertical', height: '24', children: child },
};

export const InlineInText: Story = {
  name: 'Inline',
  render: () => (
    <p>
      Text around{' '}
      <Center inline as="span">
        a centered box
      </Center>{' '}
      in a line.
    </p>
  ),
};
