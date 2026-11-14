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
