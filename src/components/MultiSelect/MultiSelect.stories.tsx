import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field';
import type { Option } from '../Select';
import { Stack } from '../Stack';
import { MultiSelect } from './MultiSelect';

const topics: Option[] = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'legal', label: 'Legal', disabled: true },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: {
    options: topics,
    placeholder: 'Choose topics',
    'aria-label': 'Topics',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Several choices, with `string[]` values and `[]` as the empty value. By default it’s a button like `Select`’s, showing the first label and a count, such as “Design +2”; every selected label is also in its description, so truncation hides nothing from screen readers. The popup stays open while choosing. With `searchable`, it’s chips and a search input instead. `ref`, `className`, and layout props go to the trigger by default, and to the input and chip wrapper with `searchable`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Playground: Story = {};

export const InAField: Story = {
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Topics" hint="Choose any that apply">
        <MultiSelect options={topics} defaultValue={['design', 'writing']} />
      </Field>
      <Field label="Topics" error="Choose at least one" required>
        <MultiSelect options={topics} placeholder="Choose topics" />
      </Field>
      <Field label="Topics" disabled>
        <MultiSelect options={topics} defaultValue={['research']} />
      </Field>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <MultiSelect
          key={size}
          aria-label={`Topics, ${size}`}
          options={topics}
          size={size}
          defaultValue={['design', 'research']}
        />
      ))}
    </Stack>
  ),
};

export const Truncated: Story = {
  name: 'Narrow, truncated',
  render: () => (
    <div style={{ width: 200 }}>
      <MultiSelect
        aria-label="Topics"
        options={[
          { value: 'methods', label: 'Interdisciplinary research methods' },
          ...topics,
        ]}
        defaultValue={['methods', 'design', 'writing']}
      />
    </div>
  ),
};

export const Groups: Story = {
  args: {
    options: [
      {
        label: 'Craft',
        options: [
          { value: 'design', label: 'Design' },
          { value: 'writing', label: 'Writing' },
        ],
      },
      {
        label: 'Practice',
        options: [
          { value: 'research', label: 'Research' },
          { value: 'engineering', label: 'Engineering' },
        ],
      },
    ],
  },
};

export const Open: Story = {
  args: { defaultValue: ['design', 'writing'] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await within(document.body).findByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Writing' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};
