import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Field } from '../Field';
import { Inline } from '../Inline';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Text } from '../Text';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from './index';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Overlays/Dialog',
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const body = () => within(document.body);

function Sample({
  label,
  size,
  ...props
}: { label: string } & Pick<DialogContentProps, 'size'> &
  React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogTrigger>
        <Button variant="soft">{label}</Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Your team will see these changes.</DialogDescription>
        <Field label="Name">
          <Input />
        </Field>
        <Inline justify="end">
          <DialogClose>
            <Button variant="soft">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button>Save</Button>
          </DialogClose>
        </Inline>
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = {
  render: (args) => <Sample label="Edit profile" {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog', { name: 'Edit profile' });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3">
      <Sample label="Small" size="sm" />
      <Sample label="Medium" size="md" />
      <Sample label="Large" size="lg" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Large' }),
    );
    const dialog = await body().findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** A long form shouldn't lose its input to a stray click, so only `Escape` and the buttons close it. */
export const FormDialog: Story = {
  render: () => <Sample label="Edit profile" closeOnOutsideClick={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** `alert` confirms something destructive: no close button, and clicking outside does nothing. */
export const ConfirmDelete: Story = {
  render: () => (
    <Dialog alert>
      <DialogTrigger>
        <Button tone="danger">Delete project</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>
          This removes the project and its files. You can’t undo it.
        </DialogDescription>
        <Inline justify="end">
          <DialogClose>
            <Button variant="soft">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button tone="danger">Delete</Button>
          </DialogClose>
        </Inline>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('alertdialog');
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(body().queryByRole('button', { name: 'Close' })).toBeNull();
  },
};

/** Tall content scrolls inside the dialog, which stays within the viewport. */
export const TallContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <Button variant="soft">Terms</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Terms of service</DialogTitle>
        <Stack gap="3">
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={i}>
              Paragraph {i + 1}. The quick brown fox jumps over the lazy dog,
              and keeps going until the dialog has to scroll.
            </Text>
          ))}
        </Stack>
        <DialogClose>
          <Button>Accept</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog');
    await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
  },
};
