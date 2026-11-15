import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Inline } from '../Inline';
import { Stack } from '../Stack';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
} from './index';

const meta: Meta<typeof Popover> = {
  title: 'Components/Overlays/Popover',
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

const body = () => within(document.body);

function Sample({
  label = 'Filters',
  ...content
}: { label?: string } & Pick<PopoverContentProps, 'side' | 'arrow' | 'align'>) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="soft">{label}</Button>
      </PopoverTrigger>
      <PopoverContent width="container.sm" {...content}>
        <Stack gap="3">
          <PopoverTitle>Filters</PopoverTitle>
          <PopoverDescription>Narrow the list.</PopoverDescription>
          <Checkbox label="Only open items" />
          <Checkbox label="Assigned to me" />
          <Inline justify="end">
            <PopoverClose>
              <Button>Done</Button>
            </PopoverClose>
          </Inline>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}

const openIt = async (canvasElement: HTMLElement, name?: string) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name }));
  const popup = await body().findByRole('dialog', { name: 'Filters' });
  await waitFor(() => expect(popup).toBeVisible());
  return popup;
};

export const FiltersPopover: Story = {
  render: () => <Sample />,
  play: async ({ canvasElement }) => {
    await openIt(canvasElement);
    await userEvent.click(body().getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};

export const Sides: Story = {
  render: () => (
    <Inline gap="3" justify="center" style={{ paddingBlock: '8rem' }}>
      <Sample label="Top" side="top" />
      <Sample label="Bottom" side="bottom" />
      <Sample label="Start" side="start" />
      <Sample label="End" side="end" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    await openIt(canvasElement, 'End');
  },
};

/** The arrow follows `side` and matches the popup's background, border, and shadow. */
export const WithArrow: Story = {
  render: () => (
    <Inline gap="3" justify="center" style={{ paddingBlock: '8rem' }}>
      <Sample label="Top" side="top" arrow />
      <Sample label="Bottom" side="bottom" arrow />
      <Sample label="End" side="end" arrow />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const popup = await openIt(canvasElement, 'Bottom');
    await expect(popup.querySelector('[data-side]')).not.toBeNull();
  },
};
