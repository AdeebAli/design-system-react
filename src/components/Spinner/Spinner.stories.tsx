import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../Button';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Feedback and display/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "Shows that something is working, when its duration is unknown. Use `Skeleton` when the content's shape is known, and `Progress` when the amount done is known. It draws in `currentColor`. Without `label` it's hidden from screen readers, for when nearby text or `aria-busy` already says what's happening. With `label` it's a `role=\"status\"`, but a status that mounts with its text isn't always announced, so keep a status region mounted when the announcement matters. With reduced motion it stops turning and stays visible.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Inline>
  ),
};

export const Labeled: Story = {
  args: { label: 'Loading results', size: 'lg' },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('Loading results');
  },
};

export const InText: Story = {
  render: () => (
    <Stack gap="3">
      <Text tone="muted">
        <Spinner size="sm" marginEnd="2" /> Saving draft…
      </Text>
      <Text tone="accent">
        <Spinner size="sm" marginEnd="2" /> Syncing
      </Text>
    </Stack>
  ),
};

export const InButton: Story = {
  render: () => (
    <Inline gap="3">
      <Button loading>Save</Button>
      <Button loading variant="outline">
        Save
      </Button>
    </Inline>
  ),
};
