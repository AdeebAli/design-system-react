import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Typography/Link',
  component: Link,
  args: { href: '#', children: 'A link' },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Playground: Story = {};

export const Neutral: Story = {
  args: { tone: 'neutral' },
};

export const UnderlineOnHover: Story = {
  args: { underline: 'hover' },
};

export const External: Story = {
  args: { href: 'https://example.com', external: true, children: 'Docs' },
};

export const InText: Story = {
  render: () => (
    <Stack>
      <Text size="xs">
        A small caption with an{' '}
        <Link href="#" external>
          external link
        </Link>
        .
      </Text>
      <Text size="3xl">
        Large text with an{' '}
        <Link href="#" external>
          external link
        </Link>
        .
      </Text>
    </Stack>
  ),
};
