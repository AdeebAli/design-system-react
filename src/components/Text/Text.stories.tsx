import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../Stack';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Typography/Text',
  component: Text,
  args: { children: 'The quick brown fox jumps over the lazy dog.' },
  parameters: {
    docs: {
      description: {
        component:
          'Body text. Unset props inherit, so `<Text as="span">` keeps the surrounding style. Use `as="span"` inside a sentence, and `as="label"` for a label.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

const sentence = 'The quick brown fox jumps over the lazy dog.';
const long = sentence.repeat(8);

export const Playground: Story = {};

export const Weights: Story = {
  render: () => (
    <Stack>
      <Text weight="regular">Regular</Text>
      <Text weight="medium">Medium</Text>
      <Text weight="semibold">Semibold</Text>
      <Text weight="bold">Bold</Text>
    </Stack>
  ),
};

export const Tones: Story = {
  render: () => (
    <Stack>
      <Text>Inherited</Text>
      <Text tone="muted">Muted</Text>
      <Text tone="accent">Accent</Text>
      <Text tone="success">Success</Text>
      <Text tone="warning">Warning</Text>
      <Text tone="danger">Danger</Text>
      <Text tone="info">Info</Text>
    </Stack>
  ),
};

export const Families: Story = {
  render: () => (
    <Stack>
      <Text family="sans">Sans: Il1 O0</Text>
      <Text family="mono">Mono: Il1 O0</Text>
      <Text family="prose">Prose: Il1 O0</Text>
    </Stack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <Stack>
      <Text align="start">Start</Text>
      <Text align="center">Center</Text>
      <Text align="end">End</Text>
    </Stack>
  ),
};

export const Numeric: Story = {
  render: () => (
    <Stack gap="0">
      <Text numeric>1,111.11</Text>
      <Text numeric>8,888.88</Text>
    </Stack>
  ),
};

export const Truncate: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Text truncate>{long}</Text>
      <Text as="span" truncate>
        {long}
      </Text>
    </Stack>
  ),
};

export const LineClamp: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Text lineClamp="2">{long}</Text>
      <Text as="span" lineClamp="3">
        {long}
      </Text>
    </Stack>
  ),
};
