import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from '../Icon';
import { InfoIcon } from '../Icon/internal/Info';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Avatar } from './Avatar';

// A self-contained portrait, so the stories need no network.
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c7d2fe"/><circle cx="32" cy="26" r="12" fill="#4338ca"/><rect x="12" y="42" width="40" height="30" rx="20" fill="#4338ca"/></svg>',
)}`;

const meta: Meta<typeof Avatar> = {
  title: 'Components/Feedback and display/Avatar',
  component: Avatar,
  args: { name: 'Ada Park' },
  parameters: {
    docs: {
      description: {
        component:
          'Represents a person or organization. `name` is required: it\'s the accessible name and the source of the initials, which show until the image loads and if it fails. The image is in the server HTML. A screen reader hears the name once, with the status when set, such as "Ada Park, online". Set `decorative` when the name is already beside it; then say any status nearby too. Status is displayed, not announced when it changes. `colorFromName` picks one of six color pairs from the name, so the same name always gets the same color, but different names can share one.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3">
      <Avatar name="Ada Park" size="sm" />
      <Avatar name="Ada Park" size="md" />
      <Avatar name="Ada Park" size="lg" />
      <Avatar name="Ada Park" size="xl" />
    </Inline>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Inline gap="3">
      <Avatar name="Ada Park" size="lg" />
      <Avatar name="Northwind Labs" size="lg" shape="square" />
    </Inline>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Inline gap="3">
      <Avatar name="Ada Park" src={portrait} size="lg" />
      <Avatar name="Ada Park" src={portrait} size="lg" shape="square" />
    </Inline>
  ),
};

export const BrokenImage: Story = {
  args: { src: '/no-such-avatar.png', size: 'lg' },
};

export const Statuses: Story = {
  render: () => (
    <Stack gap="4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Inline gap="3" key={size}>
          <Avatar name="Ada Park" size={size} status="online" />
          <Avatar name="Ben Ito" size={size} status="away" />
          <Avatar name="Cara Diaz" size={size} status="busy" />
          <Avatar name="Dev Shah" size={size} status="offline" />
          <Avatar name="Eve Lund" size={size} status="online" src={portrait} />
          <Avatar name="Fay Moss" size={size} status="busy" shape="square" />
        </Inline>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('img', { name: 'Ben Ito, away' }),
    ).toHaveLength(4);
  },
};

export const ColorFromName: Story = {
  render: () => (
    <Inline gap="3">
      {[
        'Ada Park',
        'Ben Ito',
        'Cara Diaz',
        'Dev Shah',
        'Eve Lund',
        'Fay Moss',
        'Gil Ortiz',
      ].map((name) => (
        <Avatar key={name} name={name} colorFromName size="lg" />
      ))}
    </Inline>
  ),
};

export const CustomFallback: Story = {
  args: {
    name: 'Unknown sender',
    size: 'lg',
    fallback: <Icon icon={InfoIcon} size="md" />,
  },
};

/** The name is beside it, so the avatar is decorative and the status is said in the text. */
export const Decorative: Story = {
  render: () => (
    <Inline gap="2">
      <Avatar name="Ada Park" decorative status="online" />
      <Text>Ada Park (online)</Text>
    </Inline>
  ),
};

export const NonLatinNames: Story = {
  render: () => (
    <Inline gap="3">
      <Avatar name="Đặng Văn" size="lg" colorFromName />
      <Avatar name="김 민준" size="lg" colorFromName />
      <Avatar name="Émile Zola" size="lg" colorFromName />
    </Inline>
  ),
};
