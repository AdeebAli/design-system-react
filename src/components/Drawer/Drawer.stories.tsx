import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Field } from '../Field';
import { Inline } from '../Inline';
import { Input } from '../Input';
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
          '`DrawerTrigger` takes one element that renders a `button`, such as `Button`. A drawer is modal: focus is trapped, the page behind is inert, and scrolling is locked. `side` is `start` or `end` and follows text direction, so it flips in right-to-left languages. Name it with `DrawerTitle` (or `aria-label` on `DrawerContent`). `Escape` and the close button close it, and so does clicking outside unless `closeOnOutsideClick` is `false`. A controlled `Drawer` with no `DrawerTrigger` needs `finalFocus`, so focus has somewhere to return.',
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
    side?: 'start' | 'end';
  } & React.ComponentProps<typeof Drawer>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger>
        <Button variant="soft">{label}</Button>
      </DrawerTrigger>
      <DrawerContent side={side} size={size}>
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

/** `start` and `end` follow text direction: with `dir="rtl"` on the page, `start` opens on the right. */
export const Sides: Story = {
  render: () => (
    <Inline gap="3">
      <Sample label="Start" side="start" />
      <Sample label="End" side="end" />
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
