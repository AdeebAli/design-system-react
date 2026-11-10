import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../Dialog';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from './index';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    docs: {
      description: {
        component:
          "A list of actions. `MenuTrigger` takes one element that renders a `button`, such as `Button`. Arrow keys, Home, End, type-ahead, and `Escape` work as in any menu, and focus returns to the trigger on close. It is non-modal, so the page keeps scrolling. `MenuItem` and `MenuLinkItem` close the menu on click; checkbox and radio items stay open. `MenuLinkItem` takes `as` for a router link. It isn't for navigation bars or choosing a form value: use `NavBar` and `Select`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

const body = () => within(document.body);

const openIt = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Actions' }),
  );
  const menu = await body().findByRole('menu');
  await waitFor(() => expect(menu).toBeVisible());
  return menu;
};

/**
 * An open menu renders Base UI's focus guards: `aria-hidden` spans with
 * `tabindex="0"` (`[data-base-ui-focus-guard]`, from
 * `@base-ui/react/utils/FocusGuard.js`), which they need to catch focus leaving
 * the popup. Axe flags only these as `aria-hidden-focus`, so that one rule is off
 * for the stories that leave a menu open. Everything else stays audited.
 */
const baseUiFocusGuards = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const Actions: Story = {
  parameters: baseUiFocusGuards,
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="soft">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem startIcon={<Icon icon={Pencil} />}>Edit</MenuItem>
        <MenuLinkItem href="#project">View project</MenuLinkItem>
        <MenuItem disabled>Archive</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" startIcon={<Icon icon={Trash2} />}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await openIt(canvasElement);
    await userEvent.hover(body().getByRole('menuitem', { name: 'Edit' }));
  },
};

/** The check column appears only because this menu has checkable items. */
export const CheckableItems: Story = {
  parameters: baseUiFocusGuards,
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="soft">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuCheckboxItem defaultChecked>Show grid</MenuCheckboxItem>
        <MenuCheckboxItem>Show rulers</MenuCheckboxItem>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Sort by</MenuGroupLabel>
          <MenuRadioGroup defaultValue="name">
            <MenuRadioItem value="name">Name</MenuRadioItem>
            <MenuRadioItem value="date">Date</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem>Reset view</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await openIt(canvasElement);
    await userEvent.click(body().getByRole('menuitemradio', { name: 'Date' }));
    await expect(body().getByRole('menu')).toBeVisible();
    await expect(
      body().getByRole('menuitemradio', { name: 'Date' }),
    ).toHaveAttribute('data-checked');
  },
};

export const TallMenu: Story = {
  parameters: baseUiFocusGuards,
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="soft">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        {Array.from({ length: 40 }, (_, i) => (
          <MenuItem key={i}>Item {i + 1}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const menu = await openIt(canvasElement);
    await expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
  },
};

export const Submenu: Story = {
  parameters: baseUiFocusGuards,
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="soft">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Open</MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger startIcon={<Icon icon={Pencil} />}>
            Share
          </MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Copy link</MenuItem>
            <MenuItem>Email</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSubmenu disabled>
          <MenuSubmenuTrigger>Move to</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Archive</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await openIt(canvasElement);
    await userEvent.click(body().getByRole('menuitem', { name: 'Share' }));
    const nested = await body().findByRole('menuitem', { name: 'Copy link' });
    await waitFor(() => expect(nested).toBeVisible());
  },
};

/** Row actions on an `IconButton`: a labeled trigger with a menu of view options and actions. */
export const RowActions: Story = {
  parameters: baseUiFocusGuards,
  render: () => (
    <Menu>
      <MenuTrigger>
        <IconButton
          aria-label="Row actions"
          icon={<Icon icon={Ellipsis} />}
          variant="ghost"
        />
      </MenuTrigger>
      <MenuContent>
        <MenuItem startIcon={<Icon icon={Pencil} />}>Edit</MenuItem>
        <MenuCheckboxItem defaultChecked>Pinned</MenuCheckboxItem>
        <MenuSeparator />
        <MenuItem tone="danger" startIcon={<Icon icon={Trash2} />}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Row actions' }),
    );
    const menu = await body().findByRole('menu');
    await waitFor(() => expect(menu).toBeVisible());
  },
};

function ConfirmDelete() {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Menu>
        <MenuTrigger>
          <IconButton
            ref={triggerRef}
            aria-label="Row actions"
            icon={<Icon icon={Ellipsis} />}
            variant="ghost"
          />
        </MenuTrigger>
        <MenuContent>
          <MenuItem tone="danger" onClick={() => setConfirming(true)}>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog alert open={confirming} onOpenChange={setConfirming}>
        <DialogContent finalFocus={triggerRef}>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>This can&apos;t be undone.</DialogDescription>
          <DialogClose>
            <Button variant="soft">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Confirm-delete recipe. A `MenuItem` can't be a `DialogTrigger`, so open a
 * controlled `Dialog alert` from its `onClick`, and point `finalFocus` at the
 * `MenuTrigger`'s child, because the item is gone once the menu closes.
 */
export const ConfirmDeleteFromMenu: Story = {
  render: () => <ConfirmDelete />,
  play: async ({ canvasElement }) => {
    const trigger = () =>
      within(canvasElement).getByRole('button', { name: 'Row actions' });
    await userEvent.click(trigger());
    await userEvent.click(
      await body().findByRole('menuitem', { name: 'Delete' }),
    );
    const dialog = await body().findByRole('alertdialog');
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(body().queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger()).toHaveFocus());
  },
};
