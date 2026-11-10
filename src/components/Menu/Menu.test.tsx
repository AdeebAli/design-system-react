import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Button } from '../Button';
import * as styles from './Menu.css';
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
  type MenuProps,
} from './index';

function Example({ children, ...props }: MenuProps) {
  return (
    <Menu {...props}>
      <MenuTrigger>
        <Button>Actions</Button>
      </MenuTrigger>
      <MenuContent>{children}</MenuContent>
    </Menu>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Actions' });
const open = () => userEvent.click(trigger());
const closed = () =>
  expect.poll(() => screen.queryByRole('menu')).not.toBeInTheDocument();

it('uncontrolled: the trigger opens it', async () => {
  render(
    <Example>
      <MenuItem>Edit</MenuItem>
    </Example>,
  );
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  await open();
  expect(await screen.findByRole('menu')).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
});

it('controlled: onOpenChange receives only the boolean', async () => {
  const onOpenChange = vi.fn();
  render(
    <Example open={false} onOpenChange={onOpenChange}>
      <MenuItem>Edit</MenuItem>
    </Example>,
  );
  await open();
  await expect.poll(() => onOpenChange).toHaveBeenCalledWith(true);
  expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

it('open: MenuContent has data-open and the trigger child has data-popup-open', async () => {
  render(
    <Example>
      <MenuItem>Edit</MenuItem>
    </Example>,
  );
  expect(trigger()).not.toHaveAttribute('data-popup-open');
  await open();
  expect(await screen.findByRole('menu')).toHaveAttribute('data-open');
  expect(trigger()).toHaveAttribute('data-popup-open');
});

it('the trigger child gets props and ref', () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Menu>
      <MenuTrigger data-extra="yes">
        <Button ref={ref}>Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Edit</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(ref.current).toBe(trigger());
  expect(trigger()).toHaveAttribute('data-extra', 'yes');
});

describe('MenuItem', () => {
  it('onClick fires and the menu closes', async () => {
    const onClick = vi.fn();
    render(
      <Example>
        <MenuItem onClick={onClick}>Edit</MenuItem>
      </Example>,
    );
    await open();
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    await closed();
  });

  it('closeOnClick={false} keeps it open', async () => {
    const onClick = vi.fn();
    render(
      <Example>
        <MenuItem onClick={onClick} closeOnClick={false}>
          Edit
        </MenuItem>
      </Example>,
    );
    await open();
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('a disabled item has data-disabled and does not fire', async () => {
    const onClick = vi.fn();
    render(
      <Example>
        <MenuItem disabled onClick={onClick}>
          Edit
        </MenuItem>
      </Example>,
    );
    await open();
    const item = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(item).toHaveAttribute('data-disabled');
    await userEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('the highlighted item has data-highlighted', async () => {
    render(
      <Example>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Copy</MenuItem>
      </Example>,
    );
    await open();
    const edit = await screen.findByRole('menuitem', { name: 'Edit' });
    await userEvent.hover(edit);
    expect(edit).toHaveAttribute('data-highlighted');
    expect(screen.getByRole('menuitem', { name: 'Copy' })).not.toHaveAttribute(
      'data-highlighted',
    );
  });

  it('tone="danger" sets its class', async () => {
    render(
      <Example>
        <MenuItem tone="danger">Delete</MenuItem>
        <MenuItem>Edit</MenuItem>
      </Example>,
    );
    await open();
    expect(
      (await screen.findByRole('menuitem', { name: 'Delete' })).classList,
    ).toContain(styles.danger);
    expect(
      screen.getByRole('menuitem', { name: 'Edit' }).classList,
    ).not.toContain(styles.danger);
  });

  it('startIcon renders before the label', async () => {
    render(
      <Example>
        <MenuItem startIcon={<svg data-testid="icon" />}>Edit</MenuItem>
      </Example>,
    );
    await open();
    const item = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(item.firstElementChild).toContainElement(screen.getByTestId('icon'));
  });
});

describe('MenuLinkItem', () => {
  it('renders a link that closes the menu on click', async () => {
    render(
      <Example>
        <MenuLinkItem href="#project" onClick={(e) => e.preventDefault()}>
          View project
        </MenuLinkItem>
      </Example>,
    );
    await open();
    const link = await screen.findByRole('menuitem', { name: 'View project' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#project');
    await userEvent.click(link);
    await closed();
  });

  it('closeOnClick={false} keeps it open', async () => {
    render(
      <Example>
        <MenuLinkItem
          href="#project"
          closeOnClick={false}
          onClick={(e) => e.preventDefault()}
        >
          View project
        </MenuLinkItem>
      </Example>,
    );
    await open();
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'View project' }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('as renders the given component, with href and a ref', async () => {
    const Custom = forwardRef<
      HTMLAnchorElement,
      ComponentPropsWithoutRef<'a'> & { 'data-custom'?: string }
    >(function Custom({ children, ...props }, ref) {
      return (
        <a ref={ref} data-custom="yes" {...props}>
          {children}
        </a>
      );
    });
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Example>
        <MenuLinkItem
          as={Custom}
          ref={ref}
          href="/projects/1"
          onClick={(e) => e.preventDefault()}
        >
          View project
        </MenuLinkItem>
      </Example>,
    );
    await open();
    const link = await screen.findByRole('menuitem', { name: 'View project' });
    expect(link).toHaveAttribute('data-custom', 'yes');
    expect(link).toHaveAttribute('href', '/projects/1');
    expect(ref.current).toBe(link);
    // Base UI's item behavior is kept.
    await userEvent.hover(link);
    expect(link).toHaveAttribute('data-highlighted');
    await userEvent.click(link);
    await closed();
  });
});

describe('MenuCheckboxItem', () => {
  it('sets data-checked/data-unchecked and shows the check only when checked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Example>
        <MenuCheckboxItem onCheckedChange={onCheckedChange}>
          Show grid
        </MenuCheckboxItem>
      </Example>,
    );
    await open();
    const item = await screen.findByRole('menuitemcheckbox', {
      name: 'Show grid',
    });
    expect(item).toHaveAttribute('data-unchecked');
    expect(item.querySelector('svg')).toBeNull();
    await userEvent.click(item);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onCheckedChange.mock.calls[0]).toHaveLength(1);
    // closeOnClick defaults to false for checkable items.
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(item).toHaveAttribute('data-checked');
    expect(item.querySelector('svg')).not.toBeNull();
  });

  it('controlled checked is respected', async () => {
    render(
      <Example>
        <MenuCheckboxItem checked>Show grid</MenuCheckboxItem>
      </Example>,
    );
    await open();
    expect(
      await screen.findByRole('menuitemcheckbox', { name: 'Show grid' }),
    ).toHaveAttribute('data-checked');
  });
});

describe('MenuRadioGroup', () => {
  it('sets data-checked on the selected item; onValueChange gets only the value', async () => {
    const onValueChange = vi.fn();
    render(
      <Example>
        <MenuRadioGroup defaultValue="name" onValueChange={onValueChange}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date">Date</MenuRadioItem>
        </MenuRadioGroup>
      </Example>,
    );
    await open();
    const name = await screen.findByRole('menuitemradio', { name: 'Name' });
    const date = screen.getByRole('menuitemradio', { name: 'Date' });
    expect(name).toHaveAttribute('data-checked');
    expect(name.querySelector('svg')).not.toBeNull();
    expect(date).toHaveAttribute('data-unchecked');
    expect(date.querySelector('svg')).toBeNull();
    await userEvent.click(date);
    expect(onValueChange).toHaveBeenCalledWith('date');
    expect(onValueChange.mock.calls[0]).toHaveLength(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(date).toHaveAttribute('data-checked');
    expect(name).toHaveAttribute('data-unchecked');
  });
});

it('MenuGroupLabel names its group', async () => {
  render(
    <Example>
      <MenuGroup>
        <MenuGroupLabel>Sort by</MenuGroupLabel>
        <MenuItem>Name</MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuItem>Other</MenuItem>
    </Example>,
  );
  await open();
  expect(
    await screen.findByRole('group', { name: 'Sort by' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('separator')).toBeInTheDocument();
});

describe('MenuSubmenu', () => {
  it('reports open changes with only the boolean, and shows its content when controlled open', async () => {
    const onOpenChange = vi.fn();
    render(
      <Example defaultOpen>
        <MenuSubmenu onOpenChange={onOpenChange}>
          <MenuSubmenuTrigger>More</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Nested</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
      </Example>,
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'More' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Nested' }),
    ).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  });

  it('disabled: the trigger is disabled and the submenu does not open', async () => {
    render(
      <Example defaultOpen>
        <MenuSubmenu disabled>
          <MenuSubmenuTrigger>More</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Nested</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
      </Example>,
    );
    const item = screen.getByRole('menuitem', { name: 'More' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(item);
    expect(screen.queryByRole('menuitem', { name: 'Nested' })).toBeNull();
  });
});
