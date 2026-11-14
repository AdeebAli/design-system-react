import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, CreditCard, LayoutDashboard } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Tab } from './Tab';
import { Tabs } from './Tabs';
import { TabsList } from './TabsList';
import { TabsPanel } from './TabsPanel';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: { defaultValue: 'overview' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Account views">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="billing" disabled>
          Billing
        </Tab>
      </TabsList>
      <TabsPanel value="overview" marginTop="4">
        <Text>Overview content.</Text>
      </TabsPanel>
      <TabsPanel value="activity" marginTop="4">
        <Text>Activity content.</Text>
      </TabsPanel>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        component:
          '**Tabs or links?** `Tabs` switch between panels in the same page, without changing the URL. For links between pages, use `NavBar`; a URL-driven row of tabs should be links, not `Tab`. Set `value` or `defaultValue`. Arrow keys move focus between tabs, and `Enter` or `Space` selects one, so moving through tabs doesn’t load content by accident. Name the list with `aria-label` or `aria-labelledby`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {};

export const Underline: Story = {
  args: { variant: 'underline' },
};

export const Pill: Story = {
  args: { variant: 'pill' },
};

export const Small: Story = {
  render: (args) => (
    <Stack gap="6">
      {(['underline', 'pill'] as const).map((variant) => (
        <Tabs key={variant} {...args} variant={variant} size="sm">
          <TabsList aria-label={`Small ${variant} tabs`}>
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
          </TabsList>
        </Tabs>
      ))}
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Account views">
        <Tab value="overview" startIcon={<Icon icon={LayoutDashboard} />}>
          Overview
        </Tab>
        <Tab value="activity" startIcon={<Icon icon={Activity} />}>
          Activity
        </Tab>
        <Tab value="billing" startIcon={<Icon icon={CreditCard} />}>
          Billing
        </Tab>
      </TabsList>
    </Tabs>
  ),
};

/** `keepMounted` keeps a hidden panel's form state. */
export const KeepMounted: Story = {
  args: { defaultValue: 'profile' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Settings">
        <Tab value="profile">Profile</Tab>
        <Tab value="other">Other</Tab>
      </TabsList>
      <TabsPanel value="profile" keepMounted marginTop="4">
        <Field label="Display name">
          <Input />
        </Field>
      </TabsPanel>
      <TabsPanel value="other" marginTop="4">
        <Text>Switch back: the name you typed is still there.</Text>
      </TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'Ada');
    await userEvent.click(canvas.getByRole('tab', { name: 'Other' }));
    await userEvent.click(canvas.getByRole('tab', { name: 'Profile' }));
    await expect(canvas.getByRole('textbox')).toHaveValue('Ada');
  },
};

/** A long list scrolls sideways, with a thin scrollbar as the hint. */
export const LongList: Story = {
  args: { defaultValue: 'Section 1' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Sections" maxWidth="container.sm">
        {Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`).map(
          (name) => (
            <Tab key={name} value={name}>
              {name}
            </Tab>
          ),
        )}
      </TabsList>
    </Tabs>
  ),
};
