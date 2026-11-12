import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { VisuallyHidden } from '../VisuallyHidden';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { height: '10' },
  parameters: {
    docs: {
      description: {
        component:
          'A placeholder for content that is loading. It is always hidden from screen readers, so set `aria-busy` on the loading region and add `VisuallyHidden` text or a live region when users need to hear about it. It has no built-in delay, so skip it for very fast loads. With reduced motion it stops pulsing and stays visible.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Stack gap="4">
      <Skeleton height="10" />
      <Skeleton variant="circle" width="10" height="10" />
      <Skeleton variant="text" lines={3} />
    </Stack>
  ),
};

export const TextInheritsFontSize: Story = {
  render: () => (
    <Stack gap="4">
      <Text size="sm">
        <Skeleton variant="text" lines={2} />
      </Text>
      <Text size="2xl">
        <Skeleton variant="text" lines={2} />
      </Text>
    </Stack>
  ),
};

export const InText: Story = {
  render: () => (
    <Text>
      Signed in as <Skeleton as="span" variant="text" width="24" />
    </Text>
  ),
};

export const LoadingRegion: Story = {
  render: () => (
    <Card aria-busy="true">
      <VisuallyHidden>Loading profile</VisuallyHidden>
      <Stack gap="3">
        <Skeleton variant="circle" width="10" height="10" />
        <Skeleton variant="text" lines={3} />
      </Stack>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Loading profile')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[aria-busy="true"]'),
    ).not.toBeNull();
  },
};
