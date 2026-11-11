import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './Dialog';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Inline } from './Inline';
import { Menu, MenuContent, MenuItem, MenuTrigger } from './Menu';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from './Popover';
import { Stack } from './Stack';
import { Text } from './Text';
import { Tooltip } from './Tooltip';

const meta: Meta = {
  title: 'Overview/Overlays',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Choose by what the user must do next. `Dialog` is for a task that needs full attention: it is modal, traps focus, and locks scrolling. `Popover` is for a small panel beside its trigger while the page stays usable. `Menu` is for a list of actions. `Tooltip` is for a short, visual-only hint: it is never announced, so the trigger needs its own name, and it never holds needed information or controls. Close a `Popover` before opening a `Dialog` from it, since a dialog opened from an open popover sits underneath it. Built with no `style` or `className`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const body = () => within(document.body);

export const ChoosingAnOverlay: Story = {
  render: () => (
    <Stack gap="6">
      <Stack gap="2">
        <Heading level={2} size="md">
          Dialog: a task that needs full attention
        </Heading>
        <Dialog>
          <DialogTrigger>
            <Button>Rename project</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Everyone on the team sees the new name.
            </DialogDescription>
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
      </Stack>
      <Stack gap="2">
        <Heading level={2} size="md">
          Popover: a small panel, with the page still usable
        </Heading>
        <Popover>
          <PopoverTrigger>
            <Button variant="soft">Filters</Button>
          </PopoverTrigger>
          <PopoverContent width="container.sm">
            <PopoverTitle>Filters</PopoverTitle>
            <PopoverDescription>Narrow the list.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </Stack>
      <Stack gap="2">
        <Heading level={2} size="md">
          Menu: a list of actions
        </Heading>
        <Menu>
          <MenuTrigger>
            <IconButton
              variant="soft"
              aria-label="Actions"
              icon={<Icon icon={Ellipsis} />}
            />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuContent>
        </Menu>
      </Stack>
      <Stack gap="2">
        <Heading level={2} size="md">
          Tooltip: a short hint that is never announced
        </Heading>
        <Tooltip content="Copies the link to your clipboard">
          <Button variant="outline">Copy link</Button>
        </Tooltip>
        <Text tone="muted" size="sm">
          Hover or focus the button above.
        </Text>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Rename project' }),
    );
    const dialog = await body().findByRole('dialog', {
      name: 'Rename project',
    });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  },
};
