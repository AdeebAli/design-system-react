import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { Icon } from '../Icon';
import { CircleCheckIcon } from '../Icon/internal/CircleCheck';
import { Stack } from '../Stack';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Feedback and display/Alert',
  component: Alert,
  args: {
    tone: 'info',
    title: 'Scheduled maintenance',
    children: 'Exports are paused on Sunday from 02:00 to 03:00 UTC.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A message that stays in the page, such as a warning above a form. Use `Toast` for brief messages that go away on their own. Each tone has its own icon, and the text should say what\'s wrong, since color is never the only signal. `title` is bold text, not a heading. It has no `"use client"`, so it works in server components; `onDismiss` needs a client parent.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap="3">
      <Alert tone="info" title="Scheduled maintenance">
        Exports are paused on Sunday from 02:00 to 03:00 UTC.
      </Alert>
      <Alert tone="success" title="Payment method added">
        Your next invoice will be charged to the card ending in 4242.
      </Alert>
      <Alert tone="warning" title="Your trial ends in 3 days">
        Add a payment method to keep your projects.
      </Alert>
      <Alert tone="danger" title="Could not save your changes">
        The connection dropped. Your edits are still here; try again.
      </Alert>
    </Stack>
  ),
};

export const WithAction: Story = {
  args: {
    tone: 'warning',
    title: 'Your trial ends in 3 days',
    children: 'Add a payment method to keep your projects.',
    action: (
      <Button size="sm" variant="soft">
        Add payment method
      </Button>
    ),
  },
};

export const BodyOnly: Story = {
  args: { title: undefined, children: 'Invitations expire after 7 days.' },
};

export const IconOptions: Story = {
  render: () => (
    <Stack gap="3">
      <Alert tone="success" icon={<Icon icon={CircleCheckIcon} />}>
        A custom icon takes the tone color unless it sets its own.
      </Alert>
      <Alert tone="info" icon={null}>
        With icon set to null, there is no icon.
      </Alert>
    </Stack>
  ),
};

/**
 * Removing the `Alert` is the project's job. If its dismiss button had
 * focus, move focus somewhere sensible, here the section heading.
 */
export const Dismissible: Story = {
  render: function Render() {
    const [shown, setShown] = useState(true);
    const heading = useRef<HTMLHeadingElement>(null);
    return (
      <Stack gap="3">
        <Heading level={2} size="md" ref={heading} tabIndex={-1}>
          Billing
        </Heading>
        {shown && (
          <Alert
            tone="warning"
            title="Your trial ends in 3 days"
            onDismiss={() => {
              setShown(false);
              heading.current?.focus();
            }}
          >
            Add a payment method to keep your projects.
          </Alert>
        )}
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(canvas.queryByText('Your trial ends in 3 days')).toBeNull();
    await expect(
      canvas.getByRole('heading', { name: 'Billing' }),
    ).toHaveFocus();
  },
};

/**
 * A screen reader reliably announces only a live region that's already on
 * the page. For an `Alert` that appears after an action, keep a status
 * region mounted around it, or use `Toast`.
 */
export const AnnouncedAfterAnAction: Story = {
  render: function Render() {
    const [saved, setSaved] = useState(false);
    return (
      <Stack gap="3" align="start">
        <Button onClick={() => setSaved(true)}>Save</Button>
        <div role="status">
          {saved && (
            <Alert tone="success" title="Saved">
              Your changes are live.
            </Alert>
          )}
        </div>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Saved');
  },
};

/**
 * `live` suits an `Alert` that's mounted and changes its text: `polite` is
 * `role="status"`, and `assertive` is `role="alert"`.
 */
export const LiveRegion: Story = {
  render: function Render() {
    const [count, setCount] = useState(0);
    return (
      <Stack gap="3" align="start">
        <Button onClick={() => setCount((n) => n + 1)}>Upload a file</Button>
        <Alert live="polite" tone="info">
          {count === 0
            ? 'No files uploaded yet.'
            : `${count} ${count === 1 ? 'file' : 'files'} uploaded.`}
        </Alert>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Upload a file' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 file uploaded.',
    );
  },
};
