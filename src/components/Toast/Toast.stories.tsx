import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Inline } from '../Inline';
import { ToastProvider, useToast, type ToastProviderProps } from './index';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Overlays/Toast',
  component: ToastProvider,
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

function Buttons() {
  const toast = useToast();
  return (
    <Inline gap="2">
      <Button
        onClick={() => toast.add({ title: 'Changes saved', tone: 'success' })}
      >
        Save
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast.add({
            title: 'Could not save',
            description: 'Check your connection.',
            tone: 'danger',
            action: { label: 'Retry', onClick: fn() },
          })
        }
      >
        Fail
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.add({ title: 'Heads up' })}
      >
        Neutral
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          void toast
            .promise(new Promise((resolve) => setTimeout(resolve, 600)), {
              loading: 'Saving…',
              success: 'Changes saved',
              error: 'Could not save',
            })
            .catch(() => undefined)
        }
      >
        Promise
      </Button>
    </Inline>
  );
}

const withProvider = (props: ToastProviderProps = {}) => (
  <ToastProvider {...props}>
    <Buttons />
  </ToastProvider>
);

export const Default: Story = {
  render: () => withProvider(),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Save' }),
    );
    const toast = await within(document.body).findByText('Changes saved');
    await waitFor(() => expect(toast).toBeVisible());
  },
};

/**
 * Base UI hides an urgent toast from the accessibility tree until it has
 * focus (a separate `role="alert"` announces it), yet the toast holds focusable
 * buttons. Axe flags only that as `aria-hidden-focus`, so that one rule is off
 * here. Everything else stays audited.
 */
const baseUiFocusGuards = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const WithAction: Story = {
  parameters: baseUiFocusGuards,
  render: () => withProvider(),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Fail' }),
    );
    await within(document.body).findByRole('button', {
      name: 'Retry',
      hidden: true,
    });
  },
};

export const TopStart: Story = {
  render: () => withProvider({ position: 'top-start' }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Neutral' }),
    );
    await within(document.body).findByText('Heads up');
  },
};

export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <ToneButtons />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'warning' }),
    );
    const title = await within(document.body).findByText('Warning toast');
    await expect(title.closest('[data-tone]')).toHaveAttribute(
      'data-tone',
      'warning',
    );
  },
};

function ToneButtons() {
  const toast = useToast();
  return (
    <Inline gap="2">
      {(['neutral', 'success', 'warning', 'info'] as const).map((tone) => (
        <Button
          key={tone}
          variant="outline"
          onClick={() =>
            toast.add({
              title: `${tone[0]!.toUpperCase()}${tone.slice(1)} toast`,
              tone,
            })
          }
        >
          {tone}
        </Button>
      ))}
    </Inline>
  );
}

export const PromiseToast: Story = {
  render: () => withProvider(),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Promise' }),
    );
    await within(document.body).findByText('Saving…');
    await within(document.body).findByText('Changes saved');
  },
};

export const BottomStart: Story = {
  render: () => withProvider({ position: 'bottom-start' }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Neutral' }),
    );
    await within(document.body).findByText('Heads up');
  },
};
