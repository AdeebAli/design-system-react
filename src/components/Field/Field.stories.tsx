import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Textarea } from '../Textarea';
import { Field } from './Field';

const meta: Meta<typeof Field> = {
  title: 'Components/Forms and actions/Field',
  component: Field,
  args: {
    label: 'Seats',
    hint: 'A whole number',
    children: <Input inputMode="numeric" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Connects a label, hint, and error to one control. It displays them; it doesn’t manage form state or validate. `error` marks the field invalid, and needs text. `required` sets `aria-required` and shows a `*`, without native validation bubbles. For native validation, put `required` directly on `Input` or `Textarea`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Name" hint="As it appears on invoices">
        <Input />
      </Field>
      <Field label="Seats" hint="A whole number" error="Enter a whole number">
        <Input defaultValue="3.5" />
      </Field>
      <Field label="Company" required>
        <Input />
      </Field>
      <Field label="Plan" hint="Contact sales to change it" disabled>
        <Input defaultValue="Annual" />
      </Field>
      <Field label="Notes" hint="Optional">
        <Textarea />
      </Field>
    </Stack>
  ),
};
