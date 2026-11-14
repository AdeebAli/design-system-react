import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Icon } from '../Icon';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Forms and actions/Button',
  component: Button,
  args: { children: 'Save changes' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

const PAIRS = [
  ['solid', 'accent'],
  ['solid', 'danger'],
  ['soft', 'neutral'],
  ['outline', 'neutral'],
  ['ghost', 'neutral'],
  ['ghost', 'danger'],
] as const;

export const Variants: Story = {
  render: () => (
    <Stack>
      {PAIRS.map(([variant, tone]) => (
        <Inline key={`${variant}-${tone}`}>
          <Button variant={variant} tone={tone}>
            {variant} {tone}
          </Button>
          <Button variant={variant} tone={tone} disabled>
            Disabled
          </Button>
          <Button variant={variant} tone={tone} loading>
            Loading
          </Button>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Inline>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Inline>
      <Button startIcon={<Icon icon={Plus} />}>New project</Button>
      <Button variant="soft" endIcon={<Icon icon={ArrowRight} />}>
        Continue
      </Button>
      <Button variant="ghost" tone="danger" startIcon={<Icon icon={Trash2} />}>
        Delete
      </Button>
    </Inline>
  ),
};

export const Loading: Story = {
  args: { loading: true, startIcon: <Icon icon={Plus} /> },
};

export const AsLink: Story = {
  args: {
    as: 'a',
    href: '#docs',
    variant: 'outline',
    children: 'Read the docs',
  },
};
