import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { Select } from './Select';

const plans = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'legacy', label: 'Legacy', disabled: true },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Forms and actions/Select',
  component: Select,
  args: { options: plans, placeholder: 'Choose a plan', 'aria-label': 'Plan' },
  parameters: {
    docs: {
      description: {
        component:
          'A single-choice dropdown from an `options` array of values and labels, optionally in groups. `null` means nothing is selected and shows the `placeholder`. With React Hook Form, use `Controller` and a default of `null`. `ref`, `className`, and layout props go to the trigger.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const InAField: Story = {
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Plan" hint="You can change it later">
        <Select options={plans} defaultValue="annual" />
      </Field>
      <Field label="Plan" error="Choose a plan" required>
        <Select options={plans} placeholder="Choose a plan" />
      </Field>
      <Field label="Plan" disabled>
        <Select options={plans} defaultValue="monthly" />
      </Field>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Select
        aria-label="Small"
        options={plans}
        size="sm"
        defaultValue="monthly"
      />
      <Select
        aria-label="Medium"
        options={plans}
        size="md"
        defaultValue="monthly"
      />
      <Select
        aria-label="Large"
        options={plans}
        size="lg"
        defaultValue="monthly"
      />
    </Stack>
  ),
};

export const Groups: Story = {
  args: {
    options: [
      { value: 'any', label: 'Any region' },
      {
        label: 'Europe',
        options: [
          { value: 'fr', label: 'France' },
          { value: 'de', label: 'Germany' },
        ],
      },
      { label: 'Americas', options: [{ value: 'us', label: 'United States' }] },
      { value: 'other', label: 'Somewhere else' },
    ],
    placeholder: 'Choose a region',
    'aria-label': 'Region',
  },
};

export const Open: Story = {
  args: { defaultValue: 'annual' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Annual' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};
