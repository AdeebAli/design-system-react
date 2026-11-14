import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Inline } from '../Inline';
import { ToastProvider, useToast, type ToastProviderProps } from './index';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Overlays/Toast',
  component: ToastProvider,
  parameters: {
    docs: {
      description: {
        component:
          'A brief message that goes away by itself. Mount `ToastProvider` once near the root, and call `useToast()` anywhere below it; `createToastManager()` is for code outside React, passed as `manager`. A toast with an `action`, or with `tone="danger"`, stays until dismissed unless it sets its own `duration`, and an `action` that times out must also be available somewhere else. `tone="danger"` is announced urgently, but Base UI hides a toast from a screen reader in browse mode while focus is outside the toasts, so a user browsing cannot reach a danger toast or its action until they press `F6`, which moves focus to the toasts. Never put the only copy of important information in a toast. Calls on a `createToastManager` manager (`add`, `update`, `close` and `promise`) wait until `<ToastProvider manager>` has mounted and then run in order, so a toast added from a descendant mount effect still shows. If the provider never mounts, the calls stay queued and nothing shows. Once a provider has mounted and then unmounted, later calls are dropped with a development warning, so an old toast cannot appear when a provider mounts again. Mount it near the root, where it stays mounted.',
      },
    },
  },
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
