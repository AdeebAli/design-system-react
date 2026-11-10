import { render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { Button } from '../Button';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
  type MenuContentProps,
} from './index';

function Example({
  place = {},
  content,
  items = ['Alpha', 'Beta', 'Gamma'],
}: {
  place?: React.CSSProperties;
  content?: MenuContentProps;
  items?: string[];
}) {
  return (
    <Menu>
      <MenuTrigger>
        <Button style={{ position: 'fixed', ...place }}>Actions</Button>
      </MenuTrigger>
      <MenuContent {...content}>
        {items.map((name) => (
          <MenuItem key={name}>{name}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Actions' });
const settled = async () => {
  const popup = await screen.findByRole('menu');
  await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
  return popup;
};
const highlighted = () =>
  document.querySelector('[role="menuitem"][data-highlighted]')?.textContent;

afterEach(async () => {
  document.documentElement.removeAttribute('dir');
  await page.viewport(414, 896);
});

it('arrow keys, Home, End, and type-ahead move the highlight', async () => {
  render(<Example items={['Alpha', 'Beta', 'Gamma', 'Zulu']} />);
  trigger().focus();
  await userEvent.keyboard('{ArrowDown}');
  await settled();
  await expect.poll(highlighted).toBe('Alpha');
  await userEvent.keyboard('{ArrowDown}');
  await expect.poll(highlighted).toBe('Beta');
  await userEvent.keyboard('{End}');
  await expect.poll(highlighted).toBe('Zulu');
  await userEvent.keyboard('{Home}');
  await expect.poll(highlighted).toBe('Alpha');
  await userEvent.keyboard('g');
  await expect.poll(highlighted).toBe('Gamma');
  await userEvent.keyboard('{ArrowUp}');
  await expect.poll(highlighted).toBe('Beta');
});

it('Escape closes it and returns focus to the trigger', async () => {
  render(<Example />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => screen.queryByRole('menu')).not.toBeInTheDocument();
  await expect.poll(() => document.activeElement).toBe(trigger());
});

it('the page still scrolls with the menu open', async () => {
  render(
    <>
      <div style={{ height: 3000 }} />
      <Example place={{ insetBlockStart: 20, insetInlineStart: 20 }} />
    </>,
  );
  await userEvent.click(trigger());
  await settled();
  const before = window.scrollY;
  window.scrollBy(0, 200);
  await expect.poll(() => window.scrollY).toBeGreaterThan(before);
});

it('a tall menu scrolls and stays within the viewport', async () => {
  await page.viewport(414, 400);
  const items = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`);
  render(
    <Example
      items={items}
      place={{ insetBlockStart: 100, insetInlineStart: 20 }}
    />,
  );
  await userEvent.click(trigger());
  const popup = await settled();
  const rect = popup.getBoundingClientRect();
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(400);
  expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
  expect(getComputedStyle(popup).overflowY).toBe('auto');
});

it('flips to the top near the bottom edge', async () => {
  render(<Example place={{ insetBlockEnd: 20, insetInlineStart: 20 }} />);
  await userEvent.click(trigger());
  const popup = await settled();
  expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    trigger().getBoundingClientRect().top,
  );
});

describe('side="end" flips near the inline-end edge', () => {
  it('LTR: moves to the left of the trigger', async () => {
    render(
      <Example
        content={{ side: 'end' }}
        place={{ insetBlockStart: 300, insetInlineEnd: 4 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(
      trigger().getBoundingClientRect().left,
    );
  });

  it('RTL: moves to the right of the trigger', async () => {
    document.documentElement.dir = 'rtl';
    render(
      <Example
        content={{ side: 'end' }}
        place={{ insetBlockStart: 300, left: 4 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      trigger().getBoundingClientRect().right,
    );
  });
});

describe('the check column', () => {
  const labelLeft = (name: string) => {
    const item = [...document.querySelectorAll('[role^="menuitem"]')].find(
      (el) => el.textContent === name,
    )!;
    const range = document.createRange();
    range.selectNodeContents(item.lastChild!);
    return range.getBoundingClientRect().left;
  };

  it('is reserved only when the menu has checkable items', async () => {
    const { unmount } = render(<Example />);
    await userEvent.click(trigger());
    await settled();
    const plain =
      labelLeft('Alpha') -
      screen.getByRole('menu').getBoundingClientRect().left;
    unmount();

    render(
      <Menu defaultOpen>
        <MenuTrigger>
          <Button>Actions</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Alpha</MenuItem>
          <MenuCheckboxItem>Beta</MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );
    await settled();
    const menuLeft = screen.getByRole('menu').getBoundingClientRect().left;
    const icon = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    // Unchecked checkable and plain items line their labels up, one icon wider than without.
    expect(labelLeft('Alpha')).toBe(labelLeft('Beta'));
    expect(labelLeft('Alpha') - menuLeft).toBeGreaterThan(plain + icon * 0.5);
  });
});

describe('submenus', () => {
  function Nested() {
    return (
      <Menu>
        <MenuTrigger>
          <Button
            style={{
              position: 'fixed',
              insetBlockStart: 20,
              insetInlineStart: 20,
            }}
          >
            Actions
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Alpha</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>More</MenuSubmenuTrigger>
            <MenuSubmenuContent>
              <MenuItem>Nested one</MenuItem>
              <MenuItem>Nested two</MenuItem>
            </MenuSubmenuContent>
          </MenuSubmenu>
        </MenuContent>
      </Menu>
    );
  }
  const more = () => screen.getByRole('menuitem', { name: 'More' });
  const sub = () => screen.queryByRole('menuitem', { name: 'Nested one' });
  const openMain = async () => {
    await userEvent.click(trigger());
    await settled();
  };

  it('opens on hover', async () => {
    render(<Nested />);
    await openMain();
    await userEvent.hover(more());
    await expect.poll(sub).toBeInTheDocument();
    expect(more()).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('opens on tap', async () => {
    render(<Nested />);
    await openMain();
    await userEvent.click(more());
    await expect.poll(sub).toBeInTheDocument();
  });

  it.each([
    ['ltr', '{ArrowRight}', '{ArrowLeft}'],
    ['rtl', '{ArrowLeft}', '{ArrowRight}'],
  ])(
    '%s: the toward arrow opens it, the opposite arrow closes only it',
    async (dir, toward, away) => {
      document.documentElement.dir = dir;
      render(<Nested />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}');
      await settled();
      // End, not ArrowDown: a leftover pointer position can pre-highlight an item.
      await userEvent.keyboard('{End}');
      await expect
        .poll(() => more().hasAttribute('data-highlighted'))
        .toBe(true);
      await userEvent.keyboard(away);
      expect(sub()).not.toBeInTheDocument();
      await userEvent.keyboard(toward);
      await expect.poll(sub).toBeInTheDocument();
      await userEvent.keyboard(away);
      await expect.poll(sub).not.toBeInTheDocument();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    },
  );

  it('Escape closes only the submenu', async () => {
    render(<Nested />);
    await openMain();
    await userEvent.click(more());
    await expect.poll(sub).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect.poll(sub).not.toBeInTheDocument();
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument();
  });

  it('the chevron flips in RTL', async () => {
    const chevron = () =>
      getComputedStyle(more().querySelector('[aria-hidden="true"]')!).transform;
    const { unmount } = render(<Nested />);
    await openMain();
    expect(chevron()).toBe('none');
    unmount();
    document.documentElement.dir = 'rtl';
    render(<Nested />);
    await openMain();
    expect(chevron()).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  });
});
