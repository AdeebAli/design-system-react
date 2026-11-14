import type { Meta, StoryObj } from '@storybook/react-vite';
import { Archive } from 'lucide-react';
import { Icon } from '../Icon';
import { Inline } from '../Inline';
import { ToggleChip } from './ToggleChip';

const meta: Meta<typeof ToggleChip> = {
  title: 'Components/Forms and actions/ToggleChip',
  component: ToggleChip,
  args: { children: 'Archived' },
  parameters: {
    docs: {
      description: {
        component:
          'A selectable pill, such as a filter. A pressed chip shows a check, so its state isn’t shown by color alone. Group chips with `ToggleChipGroup`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleChip>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Inline>
      <ToggleChip>Off</ToggleChip>
      <ToggleChip defaultPressed>On</ToggleChip>
      <ToggleChip startIcon={<Icon icon={Archive} />}>With icon</ToggleChip>
      <ToggleChip disabled>Disabled</ToggleChip>
      <ToggleChip disabled defaultPressed>
        Disabled and on
      </ToggleChip>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline>
      <ToggleChip size="sm">Small</ToggleChip>
      <ToggleChip size="md">Medium</ToggleChip>
    </Inline>
  ),
};
