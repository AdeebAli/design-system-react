import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../Box';
import { Text } from '../Text';
import { Code } from './Code';

const meta: Meta<typeof Code> = {
  title: 'Components/Typography/Code',
  component: Code,
  args: { children: 'npm run build' },
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Playground: Story = {};

export const InText: Story = {
  render: () => (
    <Text>
      Run <Code>npm run build</Code> before you publish.
    </Text>
  ),
};

export const InSmallText: Story = {
  render: () => (
    <Text size="xs">
      A caption with <Code>inline code</Code>, which stays legible.
    </Text>
  ),
};

export const OnInverseSurface: Story = {
  render: () => (
    <Box background="inverse" color="inverse" padding="4">
      Text on an inverse surface, with <Code>inline code</Code>.
    </Box>
  ),
};

export const InsidePre: Story = {
  render: () => (
    <pre>
      <Code>const inPre = true;</Code>
    </pre>
  ),
};
