import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Search } from 'lucide-react';
import { Field } from '../Field';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Forms and actions/Input',
  component: Input,
  args: { 'aria-label': 'Search', placeholder: 'Search people…' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Input aria-label="Small" size="sm" placeholder="Small" />
      <Input aria-label="Medium" size="md" placeholder="Medium" />
      <Input aria-label="Large" size="lg" placeholder="Large" />
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Field label="Search" hint="Name or email">
        <Input
          placeholder="Search people…"
          startIcon={<Icon icon={Search} />}
        />
      </Field>
      <Field label="Email">
        <Input type="email" endIcon={<Icon icon={Mail} />} />
      </Field>
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack maxWidth="container.sm">
      <Input aria-label="Invalid" invalid defaultValue="Invalid" />
      <Input aria-label="Disabled" disabled defaultValue="Disabled" />
      <Input aria-label="Read only" readOnly defaultValue="Read only" />
    </Stack>
  ),
};
