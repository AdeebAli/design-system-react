import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash2 } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Icon } from '../Icon';
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

// Axe flags Base UI's focus guards while a menu is open, so plays close it.
const closeIt = async () => {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
};

export const Actions: Story = {
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
    await userEvent.click(body().getByRole('menuitem', { name: 'Edit' }));
    await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
  },
};

/** The check column appears only because this menu has checkable items. */
export const CheckableItems: Story = {
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
    await closeIt();
  },
};

export const TallMenu: Story = {
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
    await closeIt();
  },
};
