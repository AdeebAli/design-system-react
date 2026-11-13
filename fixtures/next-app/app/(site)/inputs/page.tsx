import {
  Combobox,
  Field,
  FileUpload,
  MultiSelect,
  Stack,
} from '@adeebali/design-system-react';

// A server page: options and starting values are data, so they come from the
// server, and the controls show their labels in the server HTML (Spec 14).
const countries = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

const topics = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
];

export default function Page() {
  return (
    <Stack gap="4" as="form" aria-label="Inputs">
      <Field label="Country">
        <Combobox options={countries} defaultValue="ca" />
      </Field>
      <Field label="Topics">
        <MultiSelect options={topics} defaultValue={['design', 'writing']} />
      </Field>
      <Field label="Assignees">
        <MultiSelect
          searchable
          options={[]}
          defaultValue={['u1']}
          selectedOptions={[{ value: 'u1', label: 'Ada Lovelace' }]}
        />
      </Field>
      <Field label="Attachments">
        <FileUpload multiple name="attachments" />
      </Field>
    </Stack>
  );
}
