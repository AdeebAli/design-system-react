import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Forms and actions/Textarea',
  component: Textarea,
  args: { 'aria-label': 'Notes', placeholder: 'Add a note…' },
  parameters: {
    docs: {
      description: {
        component:
          'A multi-line text input, at least two rows tall, with the native `value` and `onChange`. `ref` and every other prop go to the `textarea`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Field label="Notes" hint="Optional">
        <Textarea />
      </Field>
      <Field label="Reason" error="Tell us why">
        <Textarea />
      </Field>
      <Field label="Archived notes" disabled>
        <Textarea defaultValue="Read only for now" />
      </Field>
      <Field label="Fixed size">
        <Textarea resize="none" rows={4} />
      </Field>
    </Stack>
  ),
};
