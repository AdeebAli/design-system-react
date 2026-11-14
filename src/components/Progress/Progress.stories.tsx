import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stack } from '../Stack';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Feedback and display/Progress',
  component: Progress,
  args: { label: 'Uploading report.pdf', value: 42, showValue: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '24rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap="4">
      <Progress label="Accent" value={64} showValue />
      <Progress label="Success" value={100} tone="success" showValue />
      <Progress label="Warning" value={82} tone="warning" showValue />
      <Progress label="Danger" value={97} tone="danger" showValue />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      <Progress label="Small" value={40} size="sm" />
      <Progress label="Medium" value={40} size="md" />
    </Stack>
  ),
};

export const Indeterminate: Story = {
  args: { label: 'Importing contacts', value: null, showValue: false },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', {
      name: 'Importing contacts',
    });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  },
};

export const WithoutVisibleLabel: Story = {
  render: () => <Progress aria-label="Syncing" value={30} size="sm" />,
};

export const OutOfRange: Story = {
  render: () => (
    <Stack gap="4">
      <Progress label="Above max (150)" value={150} showValue />
      <Progress label="Below zero (-5)" value={-5} showValue />
    </Stack>
  ),
};
