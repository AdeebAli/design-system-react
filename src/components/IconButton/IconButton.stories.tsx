import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings, Trash2, X } from 'lucide-react';
import { Icon } from '../Icon';
import { Inline } from '../Inline';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/Forms and actions/IconButton',
  component: IconButton,
  args: { icon: <Icon icon={X} />, 'aria-label': 'Close', variant: 'ghost' },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Inline>
      <IconButton icon={<Icon icon={Settings} />} aria-label="Settings" />
      <IconButton
        icon={<Icon icon={Settings} />}
        aria-label="Settings"
        variant="soft"
      />
      <IconButton
        icon={<Icon icon={Settings} />}
        aria-label="Settings"
        variant="outline"
      />
      <IconButton
        icon={<Icon icon={Settings} />}
        aria-label="Settings"
        variant="ghost"
      />
      <IconButton
        icon={<Icon icon={Trash2} />}
        aria-label="Delete"
        variant="ghost"
        tone="danger"
      />
      <IconButton
        icon={<Icon icon={Settings} />}
        aria-label="Settings"
        disabled
      />
      <IconButton
        icon={<Icon icon={Settings} />}
        aria-label="Settings"
        loading
      />
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline>
      <IconButton
        icon={<Icon icon={X} />}
        aria-label="Close"
        size="sm"
        variant="outline"
      />
      <IconButton
        icon={<Icon icon={X} />}
        aria-label="Close"
        size="md"
        variant="outline"
      />
      <IconButton
        icon={<Icon icon={X} />}
        aria-label="Close"
        size="lg"
        variant="outline"
      />
    </Inline>
  ),
};
