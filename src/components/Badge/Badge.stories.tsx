import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check } from 'lucide-react';
import { Icon } from '../Icon';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import { Badge, type BadgeTone } from './Badge';

const TONES: BadgeTone[] = [
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
];

const meta: Meta<typeof Badge> = {
  title: 'Components/Display/Badge',
  component: Badge,
  args: { children: 'Active' },
  parameters: {
    docs: {
      description: {
        component:
          'A small, non-interactive status label. The text must carry the meaning, since color alone can’t. For selectable pills, use `ToggleChip`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack>
      {(['soft', 'solid'] as const).map((variant) => (
        <Inline key={variant}>
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </Inline>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Inline>
      <Badge tone="success" startIcon={<Icon icon={Check} />}>
        Verified
      </Badge>
      <Badge
        tone="success"
        variant="solid"
        size="sm"
        startIcon={<Icon icon={Check} />}
      >
        Verified
      </Badge>
    </Inline>
  ),
};
