import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Alert } from './Alert';
import { Button } from './Button';
import { Heading } from './Heading';
import { Progress } from './Progress';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { Stack } from './Stack';
import { Text } from './Text';
import { ToastProvider, useToast } from './Toast';

const meta: Meta = {
  title: 'Patterns/Feedback',
  parameters: {
    docs: {
      description: {
        component:
          "Choose by how long the message should last and what's known about the wait. `Alert` stays in the page until the problem is fixed or the user dismisses it, such as a warning above a form. `Toast` is brief and goes away by itself, such as confirming a save; never put the only copy of important information in one. For a wait, `Progress` shows how far along something is when there's a measure, `Skeleton` holds the place of content whose shape is known, and `Spinner` is for a short wait with neither. Built with no `style` or `className`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function SaveButton() {
  const toast = useToast();
  return (
    <Button
      onClick={() => toast.add({ title: 'Changes saved', tone: 'success' })}
    >
      Save
    </Button>
  );
}

export const ChoosingAMessage: Story = {
  render: () => (
    <ToastProvider>
      <Stack gap="6">
        <Stack gap="2">
          <Heading level={2} size="md">
            Alert: stays until it&apos;s resolved
          </Heading>
          <Alert tone="warning" title="Your trial ends in 3 days">
            Add a payment method to keep your projects.
          </Alert>
        </Stack>
        <Stack gap="2" align="start">
          <Heading level={2} size="md">
            Toast: brief, and goes away by itself
          </Heading>
          <SaveButton />
        </Stack>
      </Stack>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Save' }),
    );
    await waitFor(() =>
      expect(within(document.body).getByText('Changes saved')).toBeVisible(),
    );
  },
};

export const ChoosingALoadingState: Story = {
  render: () => (
    <Stack gap="6">
      <Stack gap="2">
        <Heading level={2} size="md">
          Progress: there&apos;s a measure
        </Heading>
        <Progress label="Uploading report.pdf" value={42} showValue />
      </Stack>
      <Stack gap="2">
        <Heading level={2} size="md">
          Skeleton: the content&apos;s shape is known
        </Heading>
        <Stack gap="3">
          <Skeleton variant="circle" width="10" height="10" />
          <Skeleton variant="text" lines={3} />
        </Stack>
      </Stack>
      <Stack gap="2">
        <Heading level={2} size="md">
          Spinner: a short wait with neither
        </Heading>
        <Stack gap="2" align="start">
          <Spinner label="Loading invoices" />
          <Text tone="muted" size="sm">
            Give it a label when nothing else on the page says what&apos;s
            loading.
          </Text>
        </Stack>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('progressbar', { name: 'Uploading report.pdf' }),
    ).toHaveAttribute('aria-valuenow', '42');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading invoices',
    );
  },
};
