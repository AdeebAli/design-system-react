import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Container } from './Container';
import { Field } from './Field';
import { Grid } from './Grid';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Inline } from './Inline';
import { Input } from './Input';
import { Inset } from './Inset';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';
import { Stack } from './Stack';
import { Switch } from './Switch';
import { Textarea } from './Textarea';
import { ToggleChip } from './ToggleChip';
import { ToggleChipGroup } from './ToggleChipGroup';

const meta: Meta = {
  title: 'Patterns/Forms',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A filter form using every form control, with no `style` or `className`. `Field` connects labels, hints, and errors; it doesn’t validate. See the React Hook Form page for wiring controls to a form library.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const plans = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const regions = [
  { value: 'any', label: 'Any region' },
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
    ],
  },
  { label: 'Americas', options: [{ value: 'us', label: 'United States' }] },
];

function FilterForm({ withErrors = false }: { withErrors?: boolean }) {
  return (
    <Card as="form" aria-label="Filters" padding="lg" gap="4">
      <Heading level={2} size="xl">
        Filters
      </Heading>
      <Field label="Search" hint="Name or email" required>
        <Input
          placeholder="Search people…"
          startIcon={<Icon icon={Search} />}
        />
      </Field>
      <Grid columns={{ base: '1', md: '2' }} gap="4">
        <Field
          label="Seats"
          error={withErrors ? 'Enter a whole number' : undefined}
        >
          <Input inputMode="numeric" defaultValue={withErrors ? '3.5' : ''} />
        </Field>
        <Field label="Plan" error={withErrors ? 'Choose a plan' : undefined}>
          <Select options={plans} placeholder="Choose a plan" />
        </Field>
      </Grid>
      <Field label="Region">
        <Select options={regions} defaultValue="any" />
      </Field>
      <Field label="Billing">
        <RadioGroup defaultValue="monthly" name="billing">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" hint="Two months free" />
        </RadioGroup>
      </Field>
      <Field label="Topics" hint="Pick any">
        <ToggleChipGroup aria-label="Topics" multiple defaultValue={['design']}>
          <ToggleChip value="design">Design</ToggleChip>
          <ToggleChip value="code">Code</ToggleChip>
          <ToggleChip value="writing">Writing</ToggleChip>
        </ToggleChipGroup>
      </Field>
      <Field label="Notes">
        <Textarea placeholder="Anything else?" />
      </Field>
      <Stack gap="2">
        <Checkbox label="Include archived" defaultChecked />
        <Switch label="Live updates" />
      </Stack>
      <Inline justify="end">
        <Button variant="soft" type="reset">
          Reset
        </Button>
        <Button type="submit">Apply</Button>
      </Inline>
    </Card>
  );
}

export const FilterFormStory: Story = {
  name: 'Filter form',
  render: () => (
    <Container size="sm">
      <Inset y="6">
        <FilterForm />
      </Inset>
    </Container>
  ),
};

export const WithErrors: Story = {
  render: () => (
    <Container size="sm">
      <Inset y="6">
        <FilterForm withErrors />
      </Inset>
    </Container>
  ),
};
