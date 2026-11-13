import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Field } from '../Field';
import { Inline } from '../Inline';
import { Input } from '../Input';
import { Select } from '../Select';
import { Stack } from '../Stack';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentProps,
} from './index';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component:
          '`DrawerTrigger` takes one element that renders a `button`, such as `Button`. A drawer is modal: focus is trapped, the page behind is inert, and scrolling is locked. `side` is `start` or `end`, which follow text direction and flip in right-to-left languages, or `bottom` for a bottom sheet. A bottom sheet is as tall as its content up to 85% of the screen height and then scrolls inside, fills the width on small screens and is centered from `md` up, and swipes down to close. It keeps a focused input above the on-screen keyboard. Name it with `DrawerTitle` (or `aria-label` on `DrawerContent`). `Escape` and the close button close it, and so does clicking outside unless `closeOnOutsideClick` is `false`. A controlled `Drawer` with no `DrawerTrigger` needs `finalFocus`, so focus has somewhere to return.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const body = () => within(document.body);

function Sample({
  label,
  side,
  size,
  ...props
}: { label: string } & Pick<DrawerContentProps, 'size'> & {
    side?: 'start' | 'end' | 'bottom';
  } & React.ComponentProps<typeof Drawer>) {
  const placement: DrawerContentProps =
    side === 'bottom' ? { side } : { side, size };
  return (
    <Drawer {...props}>
      <DrawerTrigger>
        <Button variant="soft">{label}</Button>
      </DrawerTrigger>
      <DrawerContent {...placement}>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow down the list.</DrawerDescription>
        <Field label="Name">
          <Input />
        </Field>
        <DrawerClose>
          <Button variant="soft">Done</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

export const Playground: Story = {
  render: (args) => <Sample label="Filters" {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog', { name: 'Filters' });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(body().getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};

/** `start` and `end` follow text direction: with `dir="rtl"` on the page, `start` opens on the right. `bottom` is a sheet. */
export const Sides: Story = {
  render: () => (
    <Inline gap="3">
      <Sample label="Start" side="start" />
      <Sample label="End" side="end" />
      <Sample label="Bottom" side="bottom" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Start' }),
    );
    const dialog = await body().findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog).toHaveAttribute('data-side', 'start');
  },
};

/** Widths are 20, 28, and 40rem, and never more than the screen less `space.8`. */
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
export const FormDrawer: Story = {
  render: () => <Sample label="Edit filters" closeOnOutsideClick={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

/** A filters panel on the end side: a form with a `Select` and `Checkbox`es, closed by `Done`. */
export const FiltersPanel: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger>
        <Button variant="soft">Filters</Button>
      </DrawerTrigger>
      <DrawerContent side="end">
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow down the list.</DrawerDescription>
        <Field label="Status">
          <Select
            placeholder="Any status"
            options={[
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </Field>
        <Stack gap="2">
          <Checkbox label="Assigned to me" />
          <Checkbox label="Has attachments" />
        </Stack>
        <Inline justify="end" gap="2">
          <DrawerClose>
            <Button variant="soft">Reset</Button>
          </DrawerClose>
          <DrawerClose>
            <Button>Apply</Button>
          </DrawerClose>
        </Inline>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog', { name: 'Filters' });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(body().getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};

/** A bottom sheet with an input. Base UI keeps the focused input above the on-screen keyboard. */
export const BottomSheet: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger>
        <Button variant="soft">Add a note</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom">
        <DrawerTitle>Add a note</DrawerTitle>
        <DrawerDescription>Notes are visible to your team.</DrawerDescription>
        <Field label="Note">
          <Input />
        </Field>
        <Inline justify="end" gap="2">
          <DrawerClose>
            <Button variant="soft">Cancel</Button>
          </DrawerClose>
          <DrawerClose>
            <Button>Save</Button>
          </DrawerClose>
        </Inline>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const dialog = await body().findByRole('dialog', { name: 'Add a note' });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog).toHaveAttribute('data-side', 'bottom');
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};
