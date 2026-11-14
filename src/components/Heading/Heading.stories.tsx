import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Typography/Heading',
  component: Heading,
  args: { level: 2, children: 'A heading' },
  parameters: {
    docs: {
      description: {
        component:
          '`level` sets the tag and describes the document, so keep levels in order. `size` changes only the look.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Playground: Story = {};

export const Levels: Story = {
  render: () => (
    <Stack>
      <Heading level={1}>Level 1</Heading>
      <Heading level={2}>Level 2</Heading>
      <Heading level={3}>Level 3</Heading>
      <Heading level={4}>Level 4</Heading>
      <Heading level={5}>Level 5</Heading>
      <Heading level={6}>Level 6</Heading>
    </Stack>
  ),
};

export const SizeSeparateFromLevel: Story = {
  args: { level: 3, size: '5xl', children: 'An h3 at 5xl' },
};

export const Weights: Story = {
  render: () => (
    <Stack>
      <Heading level={2} weight="medium">
        Medium
      </Heading>
      <Heading level={2} weight="semibold">
        Semibold
      </Heading>
      <Heading level={2} weight="bold">
        Bold
      </Heading>
    </Stack>
  ),
};

export const WithSpanInside: Story = {
  render: () => (
    <Heading level={1}>
      Large with{' '}
      <Text as="span" tone="accent">
        a span
      </Text>{' '}
      inside
    </Heading>
  ),
};

export const LineClamp: Story = {
  args: {
    level: 2,
    lineClamp: '2',
    maxWidth: 'container.sm',
    children: 'A long heading that runs on past two lines. '.repeat(4),
  },
};
