import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Combobox } from './Combobox';
import { Container } from './Container';
import { Field } from './Field';
import { FileUpload } from './FileUpload';
import { Heading } from './Heading';
import { Inline } from './Inline';
import { Inset } from './Inset';
import { MultiSelect } from './MultiSelect';
import type { Option } from './Select';
import { Text } from './Text';

const meta: Meta = {
  title: 'Overview/Advanced inputs',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A form using `Combobox`, both `MultiSelect` modes, and `FileUpload`, with no `style` or `className` (Spec 14). Like the other controls, they display state and don’t validate: `Field` shows labels, hints, and errors.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const countries: Option[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'in', label: 'India' },
  { value: 'jp', label: 'Japan' },
  { value: 'ke', label: 'Kenya' },
  { value: 'mx', label: 'Mexico' },
];

const topics: Option[] = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'engineering', label: 'Engineering' },
];

const people: Option[] = [
  { value: 'u1', label: 'Ada Lovelace' },
  { value: 'u2', label: 'Grace Hopper' },
  { value: 'u3', label: 'Katherine Johnson' },
  { value: 'u4', label: 'Margaret Hamilton' },
];

function ProjectForm({ withErrors = false }: { withErrors?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <Card as="form" aria-label="New project" padding="lg" gap="4">
      <Heading level={2} size="xl">
        New project
      </Heading>
      <Field
        label="Country"
        hint="Where the work happens"
        error={withErrors ? 'Choose a country' : undefined}
        required
      >
        <Combobox
          options={countries}
          placeholder="Search countries…"
          clearable
        />
      </Field>
      <Field label="Topics" hint="Choose any that apply">
        <MultiSelect options={topics} defaultValue={['design', 'writing']} />
      </Field>
      <Field label="Team">
        <MultiSelect
          searchable
          options={people}
          defaultValue={['u1']}
          placeholder="Add people"
        />
      </Field>
      <Field
        label="Attachments"
        hint="PDF or PNG, up to 10 MB"
        error={withErrors ? 'Add at least one file' : undefined}
      >
        <FileUpload
          multiple
          accept=".pdf,image/png"
          maxSize={10_000_000}
          value={files}
          onValueChange={setFiles}
        />
      </Field>
      <Text tone="muted" size="sm">
        Files are checked here for convenience; the server checks them again.
      </Text>
      <Inline gap="2">
        <Button type="submit">Create project</Button>
        <Button type="reset" variant="soft" tone="neutral">
          Reset
        </Button>
      </Inline>
    </Card>
  );
}

export const Form: Story = {
  render: () => (
    <Container size="sm">
      <Inset y="6">
        <ProjectForm />
      </Inset>
    </Container>
  ),
};

export const WithErrors: Story = {
  render: () => (
    <Container size="sm">
      <Inset y="6">
        <ProjectForm withErrors />
      </Inset>
    </Container>
  ),
};
