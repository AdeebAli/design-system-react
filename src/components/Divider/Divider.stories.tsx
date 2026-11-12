import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Card } from '../Card';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          "A line between things. By default it's an `hr`, which screen readers announce as a separator. Most lines are decorative: when headings, cards, or spacing already separate the content, set `decorative` so a screen reader doesn't read every line. `decorative` defaults to `false` because an extra separator is the safer mistake. It has no margins of its own, so add them with layout props such as `marginY`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '28rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {};

export const WithSpacing: Story = {
  render: () => (
    <div>
      <Text>Profile</Text>
      <Divider marginY="4" />
      <Text>Notifications</Text>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Inline gap="3">
      <Text>Drafts</Text>
      <Divider orientation="vertical" />
      <Text>Sent</Text>
      <Divider orientation="vertical" />
      <Text>Archived</Text>
    </Inline>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <Stack gap="4">
      <Button>Continue with a passkey</Button>
      <Divider label="or" />
      <Button variant="outline">Continue with email</Button>
    </Stack>
  ),
};

/** The card's padding and heading already separate the footer, so the line is decorative. */
export const Decorative: Story = {
  render: () => (
    <Card>
      <Stack gap="4">
        <Text>Invoices are sent on the first of each month.</Text>
        <Divider decorative />
        <Inline justify="end">
          <Button size="sm" variant="soft">
            Download all
          </Button>
        </Inline>
      </Stack>
    </Card>
  ),
};
