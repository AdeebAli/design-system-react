import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../Box';
import { Text } from '../Text';
import { Kbd } from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'K' },
  parameters: {
    docs: {
      description: {
        component:
          'A keyboard key. For a shortcut, use one per key: `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const Shortcut: Story = {
  render: () => (
    <Text>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.
    </Text>
  ),
};

export const InSmallText: Story = {
  render: () => (
    <Text size="xs">
      Press <Kbd>Esc</Kbd> to close.
    </Text>
  ),
};

export const OnInverseSurface: Story = {
  render: () => (
    <Box background="inverse" color="inverse" padding="4">
      Press <Kbd>Esc</Kbd> to close.
    </Box>
  ),
};
