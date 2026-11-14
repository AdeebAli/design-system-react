import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Typography/Link',
  component: Link,
  args: { href: '#', children: 'A link' },
  parameters: {
    docs: {
      description: {
        component:
          'Inherits its font size. Keep the default underline for links in text, so they never rely on color alone. To use a router, pass its link as `as`, or wrap `Link` once in your project.',
      },
    },
  },
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
