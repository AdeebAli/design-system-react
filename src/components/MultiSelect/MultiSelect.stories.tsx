import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
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

export const Searchable: Story = {
  args: { searchable: true, defaultValue: ['design', 'writing'] },
};

export const SearchableInAField: Story = {
  name: 'Searchable, in a Field',
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Topics" hint="Type to filter">
        <MultiSelect
          searchable
          options={topics}
          defaultValue={['design', 'research', 'writing', 'engineering']}
        />
      </Field>
      <Field label="Topics" error="Choose at least one" required>
        <MultiSelect searchable options={topics} placeholder="Add topics" />
      </Field>
      <Field label="Topics" disabled>
        <MultiSelect searchable options={topics} defaultValue={['research']} />
      </Field>
    </Stack>
  ),
};

export const SearchableSizes: Story = {
  name: 'Searchable, sizes',
  render: () => (
    <Stack maxWidth="container.sm">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <MultiSelect
          key={size}
          searchable
          aria-label={`Topics, ${size}`}
          options={topics}
          size={size}
          defaultValue={['design']}
        />
      ))}
    </Stack>
  ),
};

export const SearchableOpen: Story = {
  name: 'Searchable, open',
  args: { searchable: true, defaultValue: ['design'] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await within(document.body).findByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Design' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

const people: Option[] = [
  { value: 'u1', label: 'Ada Lovelace' },
  { value: 'u2', label: 'Grace Hopper' },
  { value: 'u3', label: 'Katherine Johnson' },
  { value: 'u4', label: 'Margaret Hamilton' },
  { value: 'u5', label: 'Radia Perlman' },
  { value: 'u6', label: 'Frances Allen' },
];

/** Stands in for a server: answers after a delay that varies by query. */
function fetchPeople(query: string): Promise<Option[]> {
  const q = query.trim().toLowerCase();
  const result = people.filter((p) => p.label.toLowerCase().includes(q));
  return new Promise((resolve) =>
    setTimeout(() => resolve(result), 150 + ((q.length * 97) % 250)),
  );
}

function PeopleSearch() {
  const [options, setOptions] = useState<Option[]>(people.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Only the latest request may update the list.
  const latest = useRef(0);

  const search = (query: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const request = ++latest.current;
      void fetchPeople(query).then((result) => {
        if (request !== latest.current) return; // a stale response
        setOptions(result);
        setLoading(false);
      });
    }, 250);
  };

  return (
    <Field label="Assignees" hint="Results come from the server">
      <MultiSelect
        searchable
        options={options}
        loading={loading}
        onSearch={search}
        // A saved record's assignee, who isn't in the first results.
        defaultValue={['u5']}
        selectedOptions={[people[4]!]}
        placeholder="Search people…"
      />
    </Field>
  );
}

export const AsyncPeopleSearch: Story = {
  name: 'Recipe: async people search',
  parameters: {
    docs: {
      description: {
        story:
          'With `onSearch`, local filtering is off and the project supplies matching `options`; chips keep their labels as results change. `selectedOptions` labels a saved value that isn’t in the first results. The project owns debouncing and stale responses: here each keystroke waits 250ms, and a response that isn’t from the latest request is dropped.',
      },
    },
  },
  render: () => <PeopleSearch />,
};
