import { render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { Button } from './Button';
import * as styles from './Drawer/Drawer.css';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './Dialog';
import { IconButton } from './IconButton';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from './Drawer';
import { Menu, MenuContent, MenuItem, MenuTrigger } from './Menu';
import { Select } from './Select';
import { Tooltip } from './Tooltip';
import { ToastProvider, createToastManager } from './Toast';

it('Select, Menu, and Tooltip open above a Dialog and work inside it', async () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
        <Select
          aria-label="Plan"
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
          ]}
        />
        <Menu>
          <MenuTrigger>
            <Button>Actions</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Edit</MenuItem>
          </MenuContent>
        </Menu>
        <Tooltip content="Hint">
          <Button>Hover me</Button>
        </Tooltip>
      </DialogContent>
    </Dialog>,
  );
  const dialog = await screen.findByRole('dialog');

  // Select
  await userEvent.click(screen.getByRole('combobox'));
  const listbox = await screen.findByRole('listbox');
  await expect.poll(() => getComputedStyle(listbox).opacity).toBe('1');
  const lr = listbox.getBoundingClientRect();
  expect(
    listbox.contains(
      document.elementFromPoint(lr.left + lr.width / 2, lr.top + lr.height / 2),
    ),
  ).toBe(true);
  await userEvent.click(screen.getByRole('option', { name: 'Annual' }));
  await expect
    .poll(() => screen.getByRole('combobox').textContent)
    .toContain('Annual');
  expect(screen.getByRole('dialog')).toBe(dialog);

  // Menu: above the dialog, and the dialog stays open after it closes
  await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
  const menu = await screen.findByRole('menu');
  const rect = menu.getBoundingClientRect();
  const top = document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );
  expect(menu.contains(top)).toBe(true);
  await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
  await expect.poll(() => screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // Tooltip: above the dialog
  await userEvent.hover(screen.getByRole('button', { name: 'Hover me' }));
  const tip = await screen.findByText('Hint', undefined, { timeout: 3000 });
  const tr = tip.getBoundingClientRect();
  const topEl = document.elementFromPoint(
    tr.left + tr.width / 2,
    tr.top + tr.height / 2,
  );
  expect(tip.contains(topEl) || topEl === tip).toBe(true);
});

describe.each(['end', 'bottom'] as const)('a %s Drawer', (side) => {
  it('has Menu and Select open above it and working inside it', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent side={side}>
          <DrawerTitle>Settings</DrawerTitle>
          <Select
            aria-label="Plan"
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
            ]}
          />
          <Menu>
            <MenuTrigger>
              <Button>Actions</Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Edit</MenuItem>
            </MenuContent>
          </Menu>
          <DrawerClose>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox');
    await expect.poll(() => getComputedStyle(listbox).opacity).toBe('1');
    const lr = listbox.getBoundingClientRect();
    expect(
      listbox.contains(
        document.elementFromPoint(
          lr.left + lr.width / 2,
          lr.top + lr.height / 2,
        ),
      ),
    ).toBe(true);
    await userEvent.click(screen.getByRole('option', { name: 'Annual' }));
    await expect
      .poll(() => screen.getByRole('combobox').textContent)
      .toContain('Annual');

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    const rect = menu.getBoundingClientRect();
    expect(
      menu.contains(
        document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        ),
      ),
    ).toBe(true);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    await expect.poll(() => screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps its height and scrolls tall content inside the panel', async () => {
    const page = document.createElement('div');
    page.style.cssText = 'height: 4000px; width: 100%;';
    document.body.append(page);
    try {
      render(
        <Drawer defaultOpen>
          <DrawerContent side={side} aria-label="Tall">
            {Array.from({ length: 80 }, (_, i) => (
              <p key={i}>Paragraph {i}</p>
            ))}
          </DrawerContent>
        </Drawer>,
      );
      const drawer = await screen.findByRole('dialog');
      const content = drawer.querySelector<HTMLElement>(`.${styles.content}`)!;
      // The panel keeps its own height, not the content's.
      const bleed =
        3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      expect(drawer.getBoundingClientRect().height).toBeCloseTo(
        side === 'bottom'
          ? 0.85 * window.innerHeight + bleed
          : window.innerHeight,
        1,
      );
      expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
      expect(getComputedStyle(content).overflowY).toBe('auto');
    } finally {
      page.remove();
    }
  });
});

it('a Dialog opened from a MenuItem returns focus to the MenuTrigger child via finalFocus', async () => {
  // This passes even without `finalFocus`, since Base UI returns focus to the
  // MenuTrigger anyway. The next test is the one that proves `finalFocus` is used.
  function Recipe() {
    const [confirming, setConfirming] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    return (
      <>
        <Menu>
          <MenuTrigger>
            <IconButton
              ref={triggerRef}
              aria-label="Row actions"
              icon={<span>…</span>}
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
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
            <DialogClose>
              <Button>Cancel</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  render(<Recipe />);
  const trigger = () => screen.getByRole('button', { name: 'Row actions' });
  await userEvent.click(trigger());
  await userEvent.click(
    await screen.findByRole('menuitem', { name: 'Delete' }),
  );
  await screen.findByRole('alertdialog');
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await expect
    .poll(() => screen.queryByRole('alertdialog'))
    .not.toBeInTheDocument();
  await expect.poll(() => document.activeElement).toBe(trigger());
});

it('DialogContent finalFocus decides where focus lands, not just the previous focus', async () => {
  const target = { current: null as HTMLButtonElement | null };
  render(
    <>
      <button type="button" ref={(el) => void (target.current = el)}>
        Elsewhere
      </button>
      <Dialog defaultOpen>
        <DialogContent finalFocus={target}>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>
            <Button>Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>,
  );
  await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  await expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();
  await expect
    .poll(() => document.activeElement)
    .toBe(screen.getByRole('button', { name: 'Elsewhere' }));
});

it('Tooltip around MenuTrigger: hover shows the tooltip, click opens the menu', async () => {
  render(
    <Menu>
      <Tooltip content="Actions hint">
        <MenuTrigger>
          <Button>Actions</Button>
        </MenuTrigger>
      </Tooltip>
      <MenuContent>
        <MenuItem>Edit</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await userEvent.hover(trigger);
  await screen.findByText('Actions hint', undefined, { timeout: 3000 });
  await userEvent.click(trigger);
  await screen.findByRole('menu');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

describe('Toast with a Dialog open', () => {
  function setup() {
    const manager = createToastManager();
    render(
      <ToastProvider manager={manager}>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <DialogClose>
              <Button>Done</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </ToastProvider>,
    );
    return manager;
  }

  it("a toast's action button works without closing the dialog", async () => {
    const manager = setup();
    await screen.findByRole('dialog', { name: 'Settings' });
    const onClick = vi.fn();
    manager.add({ title: 'Failed', action: { label: 'Retry', onClick } });
    const retry = await screen.findByRole('button', {
      name: 'Retry',
      hidden: true,
    });
    await userEvent.click(retry);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('dialog', { name: 'Settings' }),
    ).toBeInTheDocument();
  });

  it('a danger toast\'s text appears in the role="alert" element', async () => {
    const manager = setup();
    await screen.findByRole('dialog', { name: 'Settings' });
    manager.add({ title: 'Disk full', tone: 'danger' });
    const alert = await screen.findByRole('alert', { hidden: true });
    await expect.poll(() => alert.textContent).toContain('Disk full');
    expect(
      screen.getByRole('dialog', { name: 'Settings' }),
    ).toBeInTheDocument();
  });
});
