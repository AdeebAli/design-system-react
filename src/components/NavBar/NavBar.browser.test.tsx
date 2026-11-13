import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { cdp, page, userEvent } from 'vitest/browser';
import { axNames } from '../../utils/browserTestUtils';
import { Select } from '../Select';
import { NavBar, NavBarLink } from './index';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

function Example({
  sticky = false,
  menuPosition,
}: {
  sticky?: boolean;
  menuPosition?: 'start' | 'end';
}) {
  return (
    <NavBar
      aria-label="Main"
      sticky={sticky}
      menuPosition={menuPosition}
      brand={<a href="#home">Acme</a>}
      actions={<button type="button">Sign in</button>}
    >
      <NavBarLink href="#dashboard" active>
        Dashboard
      </NavBarLink>
      <NavBarLink href="#customers">Customers</NavBarLink>
      <NavBarLink href="#blog">Blog</NavBarLink>
    </NavBar>
  );
}

const names = ['Dashboard', 'Customers', 'Blog'];
const visible = (el: Element) => el.checkVisibility();

function links(root: ParentNode = document) {
  return names.map((name) =>
    [...root.querySelectorAll('a')].find((a) => a.textContent === name)!,
  );
}

const axLinkNames = () => axNames('link');

it('from md, the links sit in one row with brand and actions, and the menu button is hidden', async () => {
  await page.viewport(1280, 800);
  render(<Example />);
  // A display: none element has no accessible name, so find it by its label.
  const menu = document.querySelector('button[aria-label="Menu"]')!;
  expect(visible(menu)).toBe(false);
  const tops = [
    ...links().map((a) => a.getBoundingClientRect()),
    screen.getByRole('link', { name: 'Acme' }).getBoundingClientRect(),
    screen.getByRole('button', { name: 'Sign in' }).getBoundingClientRect(),
  ].map((rect) => Math.round(rect.top + rect.height / 2));
  expect(new Set(tops).size).toBe(1);
  for (const a of links()) expect(visible(a)).toBe(true);
});

it('each link is in the accessibility tree once at every width', async () => {
  render(<Example />);
  await page.viewport(1280, 800);
  const wide = await axLinkNames();
  for (const name of names)
    expect(wide.filter((n) => n === name)).toHaveLength(1);
  await page.viewport(390, 800);
  // Closed on a small screen, the links are hidden, not duplicated.
  const narrow = await axLinkNames();
  for (const name of names)
    expect(narrow.filter((n) => n === name).length).toBeLessThanOrEqual(1);
});

it('below md, the menu button shows and the links are hidden', async () => {
  await page.viewport(390, 800);
  render(<Example />);
  expect(visible(screen.getByRole('button', { name: 'Menu' }))).toBe(true);
  for (const a of links()) expect(visible(a)).toBe(false);
  expect(visible(screen.getByRole('link', { name: 'Acme' }))).toBe(true);
  expect(visible(screen.getByRole('button', { name: 'Sign in' }))).toBe(true);
});

describe('menuPosition', () => {
  const left = (el: Element) => el.getBoundingClientRect().left;
  const parts = () => ({
    brand: left(screen.getByRole('link', { name: 'Acme' })),
    actions: left(screen.getByRole('button', { name: 'Sign in' })),
    menu: left(screen.getByRole('button', { name: 'Menu' })),
  });

  it('below md, end (the default) puts the menu button after the actions', async () => {
    await page.viewport(390, 800);
    render(<Example />);
    const { brand, actions, menu } = parts();
    expect(brand).toBeLessThan(actions);
    expect(actions).toBeLessThan(menu);
  });

  it('below md, start puts the menu button before the brand', async () => {
    await page.viewport(390, 800);
    render(<Example menuPosition="start" />);
    const { brand, actions, menu } = parts();
    expect(menu).toBeLessThan(brand);
    expect(brand).toBeLessThan(actions);
  });

  it('from md, start leaves the desktop layout unchanged', async () => {
    await page.viewport(1280, 800);
    render(<Example menuPosition="start" />);
    const brand = left(screen.getByRole('link', { name: 'Acme' }));
    const [first] = links();
    expect(brand).toBeLessThan(left(first!));
    expect(left(first!)).toBeLessThan(
      left(screen.getByRole('button', { name: 'Sign in' })),
    );
    expect(visible(document.querySelector('button[aria-label="Menu"]')!)).toBe(
      false,
    );
  });
});

it('server HTML shows the links from md before JavaScript runs', async () => {
  await page.viewport(1280, 800);
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(<Example />);
  try {
    for (const a of links(container)) expect(visible(a)).toBe(true);
    const menu = container.querySelector('button[aria-label="Menu"]')!;
    expect(visible(menu)).toBe(false);
  } finally {
    container.remove();
  }
});

it('sticky stays at the top after scrolling', async () => {
  await page.viewport(1280, 800);
  render(
    <div>
      <Example sticky />
      <div style={{ height: 3000 }} />
    </div>,
  );
  window.scrollTo(0, 1500);
  await expect
    .poll(() => screen.getByRole('navigation').getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(0);
  const top = screen.getByRole('navigation').getBoundingClientRect().top;
  expect(top).toBeLessThan(20);
  window.scrollTo(0, 0);
});

it('the active bar stays visible in forced colors', async () => {
  await page.viewport(1280, 800);
  render(<Example />);
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  expect(matchMedia('(forced-colors: active)').matches).toBe(true);
  const after = getComputedStyle(links()[0]!, '::after');
  expect(after.borderBottomStyle).toBe('solid');
  expect(after.borderBottomWidth).toBe('2px');
  expect(after.borderBottomColor).not.toBe(
    getComputedStyle(screen.getByRole('navigation')).backgroundColor,
  );
});

describe('below md', () => {
  beforeEach(async () => {
    await page.viewport(390, 800);
  });

  const menu = () =>
    document.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!;
  const panel = () => document.querySelector('nav ul')!.parentElement!;
  const isOpen = () => panel().hasAttribute('data-open');

  async function open() {
    await userEvent.click(menu());
    await expect.poll(isOpen).toBe(true);
  }

  it('opens the panel below the bar, pushing content down', async () => {
    render(
      <>
        <Example />
        <div data-testid="after">After</div>
      </>,
    );
    const after = screen.getByTestId('after');
    const before = after.getBoundingClientRect().top;
    await open();
    for (const a of links()) expect(visible(a)).toBe(true);
    const bar = screen.getByRole('link', { name: 'Acme' });
    expect(links()[0]!.getBoundingClientRect().top).toBeGreaterThan(
      bar.getBoundingClientRect().bottom,
    );
    expect(after.getBoundingClientRect().top).toBeGreaterThan(before);
  });

  it('the menu button has data-panel-open and the panel data-open while open', async () => {
    render(<Example />);
    expect(menu()).not.toHaveAttribute('data-panel-open');
    await open();
    expect(menu()).toHaveAttribute('data-panel-open');
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
  });

  it('Escape inside the nav closes and focuses the menu button', async () => {
    render(<Example />);
    await open();
    links()[1]!.focus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(isOpen).toBe(false);
    expect(menu()).toHaveFocus();
  });

  it('Escape still closes when the NavBar has a ref of its own', async () => {
    const ref = createRef<HTMLElement>();
    render(
      <NavBar aria-label="Main" ref={ref}>
        <NavBarLink href="#a">A</NavBarLink>
      </NavBar>,
    );
    expect(ref.current?.tagName).toBe('NAV');
    await open();
    screen.getByRole('link', { name: 'A' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(isOpen).toBe(false);
    expect(menu()).toHaveFocus();
  });

  it('an open sticky panel taller than the viewport scrolls, so every link is reachable', async () => {
    await page.viewport(390, 300);
    const names = Array.from({ length: 8 }, (_, i) => `Link ${i + 1}`);
    render(
      <div>
        <NavBar aria-label="Main" sticky>
          {names.map((name) => (
            <NavBarLink key={name} href={`#${name}`}>
              {name}
            </NavBarLink>
          ))}
        </NavBar>
        <div style={{ height: 2000 }} />
      </div>,
    );
    await open();
    const last = screen.getByRole('link', { name: 'Link 8' });
    last.focus();
    await expect
      .poll(() => last.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(window.innerHeight);
    expect(last.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  });

  it('a link click closes and focuses the menu button', async () => {
    render(<Example />);
    await open();
    await userEvent.click(links()[1]!);
    await expect.poll(isOpen).toBe(false);
    expect(menu()).toHaveFocus();
  });

  it('stacked links are at least 44px tall', async () => {
    render(<Example />);
    await open();
    for (const a of links())
      expect(a.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  it('after widening to 1280px with the panel open, a link click does not focus the hidden button', async () => {
    render(<Example />);
    await open();
    await page.viewport(1280, 800);
    await userEvent.click(links()[1]!);
    await expect.poll(isOpen).toBe(false);
    expect(menu()).not.toHaveFocus();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('Escape that closes a Select in actions leaves the panel open', async () => {
    render(
      <NavBar
        aria-label="Main"
        actions={
          <Select
            aria-label="Language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
            ]}
            defaultValue="en"
          />
        }
      >
        <NavBarLink href="#a">A</NavBarLink>
      </NavBar>,
    );
    await open();
    const combobox = screen.getByRole('combobox', { name: 'Language' });
    await userEvent.click(combobox);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.queryByRole('listbox')).toBeNull();
    expect(combobox).toHaveFocus();
    expect(isOpen()).toBe(true);
  });

  it('Escape from a portaled element in actions leaves the panel open', async () => {
    render(
      <NavBar
        aria-label="Main"
        actions={createPortal(<input aria-label="Search" />, document.body)}
      >
        <NavBarLink href="#a">A</NavBarLink>
      </NavBar>,
    );
    await open();
    screen.getByRole('textbox', { name: 'Search' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(true);
  });

  it('Escape that a control in the nav cancels leaves the panel open', async () => {
    render(
      <NavBar
        aria-label="Main"
        actions={
          <input
            aria-label="Search"
            onKeyDown={(event) => {
              if (event.key === 'Escape') event.preventDefault();
            }}
          />
        }
      >
        <NavBarLink href="#a">A</NavBarLink>
      </NavBar>,
    );
    await open();
    screen.getByRole('textbox', { name: 'Search' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(true);
  });

  it("a link's own onClick runs, and preventDefault keeps the panel open", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <NavBar aria-label="Main">
        <NavBarLink href="#a" onClick={onClick}>
          A
        </NavBarLink>
      </NavBar>,
    );
    await open();
    await userEvent.click(screen.getByRole('link', { name: 'A' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect.poll(isOpen).toBe(false);

    rerender(
      <NavBar aria-label="Main">
        <NavBarLink href="#a" onClick={(event) => event.preventDefault()}>
          A
        </NavBarLink>
      </NavBar>,
    );
    await open();
    await userEvent.click(screen.getByRole('link', { name: 'A' }));
    expect(isOpen()).toBe(true);
  });
});
