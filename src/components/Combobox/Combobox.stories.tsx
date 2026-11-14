import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Field } from '../Field';
import type { Option } from '../Select';
import { Stack } from '../Stack';
import { Combobox } from './Combobox';

const countries: Option[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'au', label: 'Australia' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'in', label: 'India' },
  { value: 'jp', label: 'Japan' },
  { value: 'ke', label: 'Kenya' },
  { value: 'mx', label: 'Mexico' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'xx', label: 'Unavailable', disabled: true },
];

const meta: Meta<typeof Combobox> = {
  title: 'Components/Advanced inputs/Combobox',
  component: Combobox,
  args: {
    options: countries,
    placeholder: 'Search countries…',
    'aria-label': 'Country',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A single choice, found by typing. Only listed options can be chosen, and leaving the input with unmatched text restores the selected label. It takes the same `options` as `Select`, and `null` means nothing is selected; with React Hook Form, use `Controller` and a default of `null`. `ref` and native attributes go to the `input`; `className`, `style`, and layout props go to its wrapper. Results are filtered locally unless `onSearch` is set, and the match count is announced.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Playground: Story = {};

export const InAField: Story = {
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Country" hint="Where you live now">
        <Combobox options={countries} defaultValue="jp" />
      </Field>
      <Field label="Country" error="Choose a country" required>
        <Combobox options={countries} placeholder="Search countries…" />
      </Field>
      <Field label="Country" disabled>
        <Combobox options={countries} defaultValue="ca" />
      </Field>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Combobox aria-label="Small" options={countries} size="sm" />
      <Combobox aria-label="Medium" options={countries} size="md" />
      <Combobox aria-label="Large" options={countries} size="lg" />
    </Stack>
  ),
};

export const Groups: Story = {
  args: {
    options: [
      {
        label: 'Europe',
        options: [
          { value: 'fr', label: 'France' },
          { value: 'de', label: 'Germany' },
        ],
      },
      {
        label: 'Asia',
        options: [
          { value: 'in', label: 'India' },
          { value: 'jp', label: 'Japan' },
        ],
      },
    ],
  },
};

export const Clearable: Story = {
  args: { clearable: true, defaultValue: 'fr' },
};

export const Open: Story = {
  args: { defaultValue: 'jp' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await within(document.body).findByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Japan' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole('combobox'), 'zzz');
    const empty = await within(document.body).findByText('No results');
    // Visible once the popup's enter transition ends.
    await waitFor(() => expect(empty).toBeVisible());
  },
};

export const Loading: Story = {
  args: { loading: true, onSearch: () => undefined, options: [] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const loading = await within(document.body).findByText('Loading');
    await waitFor(() => expect(loading).toBeVisible());
  },
};

export const StartingValueFromARecord: Story = {
  name: 'Starting value from a saved record',
  parameters: {
    docs: {
      description: {
        story:
          '`selectedOptions` gives the label of a starting value that isn’t in the current `options`, such as one loaded with a saved record.',
      },
    },
  },
  args: {
    options: countries.slice(0, 3),
    defaultValue: 'pt',
    selectedOptions: [{ value: 'pt', label: 'Portugal' }],
  },
};

/** Stands in for a server: answers after a delay that varies by query. */
function fetchCountries(query: string): Promise<Option[]> {
  const q = query.trim().toLowerCase();
  const result = countries.filter((c) => c.label.toLowerCase().includes(q));
  return new Promise((resolve) =>
    setTimeout(() => resolve(result), 150 + ((q.length * 97) % 250)),
  );
}

function DebouncedSearch() {
  const [options, setOptions] = useState<Option[]>(countries);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Only the latest request may update the list.
  const latest = useRef(0);

  const search = (query: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const request = ++latest.current;
      void fetchCountries(query).then((result) => {
        if (request !== latest.current) return; // a stale response
        setOptions(result);
        setLoading(false);
      });
    }, 250);
  };

  return (
    <Field label="Country" hint="Results come from the server">
      <Combobox
        options={options}
        loading={loading}
        onSearch={search}
        placeholder="Search countries…"
      />
    </Field>
  );
}

export const DebouncedSearchRecipe: Story = {
  name: 'Recipe: debounced search',
  parameters: {
    docs: {
      description: {
        story:
          'With `onSearch`, local filtering is off and the project supplies matching `options`. The project owns debouncing and stale responses: here each keystroke waits 250ms, and a response that isn’t from the latest request is dropped, so a slow early answer can’t replace a newer one. Selected labels survive new results.',
      },
    },
  },
  render: () => <DebouncedSearch />,
};
