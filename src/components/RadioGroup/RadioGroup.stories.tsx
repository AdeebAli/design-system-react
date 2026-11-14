import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field';
import { Radio } from '../Radio';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Forms and actions/RadioGroup',
  component: RadioGroup,
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  render: () => (
    <Field label="Plan">
      <RadioGroup defaultValue="monthly" name="plan">
        <Radio value="monthly" label="Monthly" />
        <Radio value="annual" label="Annual" hint="Two months free" />
        <Radio value="lifetime" label="Lifetime" disabled />
      </RadioGroup>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field label="Plan" error="Choose a plan" required>
      <RadioGroup name="plan">
        <Radio value="monthly" label="Monthly" />
        <Radio value="annual" label="Annual" />
      </RadioGroup>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field label="Plan" disabled>
      <RadioGroup defaultValue="annual">
        <Radio value="monthly" label="Monthly" />
        <Radio value="annual" label="Annual" />
      </RadioGroup>
    </Field>
  ),
};
