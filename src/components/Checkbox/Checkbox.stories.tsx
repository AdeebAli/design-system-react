import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Forms and actions/Checkbox',
  component: Checkbox,
  args: { label: 'Include archived' },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="With a hint" hint="Sent every Monday" />
      <Checkbox label="Invalid" invalid />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled and checked" disabled defaultChecked />
      <Checkbox aria-label="No visible label" />
    </Stack>
  ),
};

export const InAField: Story = {
  render: () => (
    <Stack gap="4">
      <Field
        label="Notifications"
        hint="Choose what we send you"
        error="Pick at least one"
      >
        <Stack role="group" aria-label="Notifications" gap="2">
          <Checkbox label="Product updates" />
          <Checkbox label="Weekly digest" />
        </Stack>
      </Field>
      <Field label="Accept the terms" required>
        <Checkbox />
      </Field>
    </Stack>
  ),
};

export const LongLabel: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Checkbox label="A long label that wraps onto a second line keeps the box aligned with its first line, and the whole label stays clickable." />
    </Stack>
  ),
};
