import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import { Stack } from './Stack';
import { Text, type FontSizeToken } from './Text';

const meta: Meta = {
  title: 'Overview/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'The type scale through `Text` and `Heading`. Each size also sets its line height and letter spacing.',
      },
    },
  },
};

export default meta;

const sizes: FontSizeToken[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
];

export const Scale: StoryObj = {
  render: () => (
    <Stack>
      {sizes.map((size) => (
        <Text key={size} size={size}>
          {size}: The quick brown fox
        </Text>
      ))}
    </Stack>
  ),
};

export const Hierarchy: StoryObj = {
  render: () => (
    <Stack gap="2" maxWidth="prose">
      <Heading level={1}>Page title</Heading>
      <Text tone="muted" size="lg">
        A short introduction, in a larger muted size.
      </Text>
      <Heading level={2}>Section</Heading>
      <Text>
        Body text at the default size. Lowercase l, uppercase I, and the digit 1
        are distinct: Il1.
      </Text>
    </Stack>
  ),
};
