import {
  Button,
  Checkbox,
  Field,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Textarea,
  ToggleChip,
  ToggleChipGroup,
} from '@adeebali/design-system-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Values {
  seats: string;
  notes: string;
  plan: string | null;
  archived: boolean;
  billing: string;
  live: boolean;
  topics: string[];
}

const plans = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

// Native controls use register; Base UI controls use Controller (Spec 09).
export function RhfForm() {
  const { register, control, handleSubmit } = useForm<Values>({
    defaultValues: {
      seats: '',
      notes: '',
      plan: null,
      archived: false,
      billing: 'monthly',
      live: false,
      topics: ['design'],
    },
  });
  const [submitted, setSubmitted] = useState<Values | null>(null);

  return (
    <form aria-label="Filters" onSubmit={handleSubmit(setSubmitted)}>
      <Stack gap="4">
        <Field label="Seats">
          <Input inputMode="numeric" {...register('seats')} />
        </Field>
        <Field label="Notes">
          <Textarea {...register('notes')} />
        </Field>
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <Field label="Plan">
              <Select
                options={plans}
                value={field.value}
                onValueChange={field.onChange}
                ref={field.ref}
              />
            </Field>
          )}
        />
        <Controller
          name="archived"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Include archived"
              checked={field.value}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
          )}
        />
        <Controller
          name="billing"
          control={control}
          render={({ field }) => (
            <Field label="Billing">
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <Radio value="monthly" label="Monthly" />
                <Radio value="yearly" label="Yearly" />
              </RadioGroup>
            </Field>
          )}
        />
        <Controller
          name="live"
          control={control}
          render={({ field }) => (
            <Switch
              label="Live updates"
              checked={field.value}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
          )}
        />
        <Controller
          name="topics"
          control={control}
          render={({ field }) => (
            <ToggleChipGroup
              aria-label="Topics"
              multiple
              value={field.value}
              onValueChange={field.onChange}
            >
              <ToggleChip value="design">Design</ToggleChip>
              <ToggleChip value="code">Code</ToggleChip>
            </ToggleChipGroup>
          )}
        />
        <Button type="submit">Apply</Button>
      </Stack>
      {submitted && (
        <pre data-testid="submitted">{JSON.stringify(submitted)}</pre>
      )}
    </form>
  );
}
