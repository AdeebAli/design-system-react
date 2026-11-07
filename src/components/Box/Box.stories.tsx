import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  args: { children: 'Box' },
  argTypes: {
    padding: {
      control: 'select',
      options: ['0', '1', '2', '3', '4', '6', '8', '12'],
    },
    background: {
      control: 'select',
      options: ['transparent', 'canvas', 'surface', 'sunken', 'muted'],
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'card'],
    },
    boxShadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'card', 'raised'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Playground: Story = {
  args: {
    padding: '4',
    background: 'surface',
    borderRadius: 'card',
    boxShadow: 'card',
  },
};

export const Responsive: Story = {
  args: {
    padding: { base: '2', md: '6', xl: '12' },
    background: 'muted',
    children: 'Padding grows at md and xl',
  },
};

export const AsLink: Story = {
  args: { as: 'a', href: '#', display: 'inline-block', padding: '2' } as never,
  name: 'As a link',
};

export const Flex: Story = {
  render: () => (
    <Box display="flex" gap="3" alignItems="center">
      <Box padding="3" background="muted" borderRadius="md">
        One
      </Box>
      <Box padding="3" background="muted" borderRadius="md">
        Two
      </Box>
    </Box>
  ),
};
