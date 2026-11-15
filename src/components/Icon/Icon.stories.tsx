import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, Info, Search, X } from 'lucide-react';
import type { SVGProps } from 'react';
import { Box } from '../Box';
import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icons/Icon',
  component: Icon,
  args: { icon: Search },
  argTypes: {
    icon: { control: false },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'inherit'] },
    tone: {
      control: 'select',
      options: [
        undefined,
        'muted',
        'accent',
        'success',
        'warning',
        'danger',
        'info',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Box display="flex" gap="3" alignItems="center">
      <Icon icon={Search} size="sm" />
      <Icon icon={Search} size="md" />
      <Icon icon={Search} size="lg" />
    </Box>
  ),
};

export const Tones: Story = {
  render: () => (
    <Box display="flex" gap="3" alignItems="center">
      <Icon icon={Info} />
      <Icon icon={Info} tone="muted" />
      <Icon icon={Info} tone="accent" />
      <Icon icon={Check} tone="success" />
      <Icon icon={Info} tone="warning" />
      <Icon icon={X} tone="danger" />
      <Icon icon={Info} tone="info" />
    </Box>
  ),
};

export const Meaningful: Story = {
  args: { icon: X, label: 'Close' },
};

function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export const CustomSvg: Story = {
  name: 'Custom SVG',
  args: { icon: Logo, tone: 'accent', size: 'lg' },
};

export const InsideText: Story = {
  render: () => (
    <p>
      Search <Icon icon={Search} size="inherit" /> lines up with the text around
      it.
    </p>
  ),
};
