import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Card } from '../Card';
import { Field } from '../Field';
import { Input } from '../Input';
import { Accordion, AccordionItem } from './index';

const meta: Meta<typeof Accordion> = {
  title: 'Components/App navigation/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          'Sections that expand in place, such as FAQs and settings. Each `AccordionItem` takes a `value`, a `title`, and its content. `Tab` moves between headers, and `Enter` and `Space` toggle. `multiple` lets more than one section stay open. `headingLevel` sets each heading’s tag (default `h3`) without changing its look. Closed content isn’t rendered, unless `keepMounted` is set, which keeps it in the DOM, hidden until found, so form state survives and the browser’s find-in-page can open it. It has no surface of its own: put it on the canvas or in a `Card`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const faq = (
  <>
    <AccordionItem value="billing" title="How does billing work?">
      You’re billed monthly, on the day you signed up. Invoices are emailed to
      the account owner.
    </AccordionItem>
    <AccordionItem value="refunds" title="Can I get a refund?">
      Yes, within 30 days of a charge. Contact support with the invoice number.
    </AccordionItem>
    <AccordionItem value="legacy" title="Legacy plans" disabled>
      Legacy plans can’t be changed.
    </AccordionItem>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} defaultValue={['billing']}>
      {faq}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Can I get a refund?' }),
    );
    await expect(canvas.getByText(/within 30 days/)).toBeVisible();
  },
};

export const Multiple: Story = {
  render: (args) => (
    <Accordion {...args} multiple defaultValue={['billing', 'refunds']}>
      {faq}
    </Accordion>
  ),
};

export const Small: Story = {
  render: (args) => (
    <Accordion {...args} size="sm">
      {faq}
    </Accordion>
  ),
};

/** On a `Card`, with no padding so the lines reach its edges. */
export const InCard: Story = {
  render: (args) => (
    <Card padding="none" clip>
      <Accordion {...args}>{faq}</Accordion>
    </Card>
  ),
};

function ControlledExample() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Accordion value={value} onValueChange={setValue}>
      {faq}
    </Accordion>
  );
}

export const Controlled: Story = { render: () => <ControlledExample /> };

/** Closed sections keep their inputs, and find-in-page can open them. */
export const KeepMounted: Story = {
  render: (args) => (
    <Accordion {...args} keepMounted>
      <AccordionItem value="profile" title="Profile">
        <Field label="Display name">
          <Input defaultValue="Ada" />
        </Field>
      </AccordionItem>
      <AccordionItem value="notifications" title="Notifications">
        Weekly summary emails are on.
      </AccordionItem>
    </Accordion>
  ),
};
