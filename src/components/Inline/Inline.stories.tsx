import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../utils/Tile';

import { Inline } from './Inline';

const meta: Meta<typeof Inline> = {
  title: 'Components/Inline',
  component: Inline,
  parameters: {
    docs: {
      description: {
        component: 'Children in a row that wraps, such as tags or buttons.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Inline>;

const many = Array.from({ length: 12 }, (_, index) => (
  <Tile key={index}>Tag {index + 1}</Tile>
));

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

export const Wrapping: Story = {
  args: { maxWidth: 'container.sm', children: many },
};

export const NoWrap: Story = {
  args: {
    wrap: 'nowrap',
    children: (
      <>
        <Tile />
        <Tile />
        <Tile />
      </>
    ),
  },
};

export const Justified: Story = {
  args: {
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
