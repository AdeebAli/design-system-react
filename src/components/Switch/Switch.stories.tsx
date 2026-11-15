import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Forms and actions/Switch',
  component: Switch,
  args: { label: 'Live updates' },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="With a hint" hint="Refreshes every few seconds" />
      <Switch label="Disabled" disabled />
      <Switch label="Disabled and on" disabled defaultChecked />
      <Field label="Sync with a Field label">
        <Switch />
      </Field>
    </Stack>
  ),
};

/**
 * Check by hand in forced-colors mode (Spec 05): the knob and the radio dot
 * draw in the text color, and the box and track keep their borders.
 */
export const ForcedColorsCheck: Story = {
  render: () => (
    <Stack>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled" disabled />
    </Stack>
  ),
};
