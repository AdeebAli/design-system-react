import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToggleChip } from '../ToggleChip';
import { ToggleChipGroup } from './ToggleChipGroup';

const meta: Meta<typeof ToggleChipGroup> = {
  title: 'Components/ToggleChipGroup',
  component: ToggleChipGroup,
  parameters: {
    docs: {
      description: {
        component:
          'A wrapping row of `ToggleChip`s, named with `aria-label` or `aria-labelledby`. One is pressed at a time unless `multiple` is set. Pressing the selected chip clears it; to keep one always selected, as with an "All" filter, control `value` and ignore empty changes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleChipGroup>;

const topics = ['All', 'Design', 'Code', 'Writing', 'Tools'];

export const Single: Story = {
  render: () => (
    <ToggleChipGroup aria-label="Topics" defaultValue={['all']}>
      {topics.map((t) => (
        <ToggleChip key={t} value={t.toLowerCase()}>
          {t}
        </ToggleChip>
      ))}
    </ToggleChipGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleChipGroup
      aria-label="Topics"
      multiple
      defaultValue={['design', 'code']}
    >
      {topics.slice(1).map((t) => (
        <ToggleChip key={t} value={t.toLowerCase()}>
          {t}
        </ToggleChip>
      ))}
    </ToggleChipGroup>
  ),
};

function AlwaysOneSelected() {
  const [value, setValue] = useState(['all']);
  return (
    <ToggleChipGroup
      aria-label="Topics"
      value={value}
      onValueChange={(next) => {
        // Ignore the empty change from pressing the selected chip.
        if (next.length > 0) setValue(next);
      }}
    >
      {topics.map((t) => (
        <ToggleChip key={t} value={t.toLowerCase()}>
          {t}
        </ToggleChip>
      ))}
    </ToggleChipGroup>
  );
}

export const AlwaysOne: Story = { render: () => <AlwaysOneSelected /> };
