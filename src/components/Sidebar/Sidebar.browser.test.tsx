import { render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { renderToString } from 'react-dom/server';
import { cdp, page, userEvent } from 'vitest/browser';
import { axNames } from '../../utils/browserTestUtils';
import { Flex } from '../Flex';
import { App } from './fixtures';

const nav = () => screen.getByRole('navigation', { name: 'Main' });
const link = (name: string) => within(nav()).getByRole('link', { name });
// From the document, since the side nav is hidden below md.
const collapseButton = () =>
  document.querySelector<HTMLButtonElement>('button[aria-label$="sidebar"]')!;
// The scrolling area holds the groups, which hold the lists.
const scroller = () =>
  link('Dashboard').closest('ul')!.parentElement!.parentElement!;

/** The app layout: the sidebar beside a tall main column, or below its bar under md. */
function Layout(props: ComponentProps<typeof App>) {
  return (
    <Flex direction={{ base: 'column', md: 'row' }}>
      <App {...props} />
      <main style={{ flexGrow: 1, minHeight: 3000 }}>Content</main>
    </Flex>
  );
}

/**
 * Stops link navigation after React has handled the click, so the code under
 * test still sees an uncancelled click. A listener on the link would run first.
 */
function stopNavigation() {
  const stop = (event: MouseEvent) => event.preventDefault();
  window.addEventListener('click', stop);
  return () => window.removeEventListener('click', stop);
}

const durations = (element: Element) =>
  getComputedStyle(element)
    .transitionDuration.split(',')
    .map((d) => parseFloat(d));

const systemColor = (name: string) => {
  const probe = document.createElement('span');
  probe.style.color = name;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

beforeEach(async () => {
  await page.viewport(1024, 768);
});

afterEach(async () => {
  window.scrollTo(0, 0);
  document.documentElement.removeAttribute('dir');
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

it('stays in view at full height while the page scrolls 2000px', async () => {
  render(<Layout />);
  expect(nav().getBoundingClientRect().height).toBe(768);
  window.scrollTo(0, 2000);
  await expect.poll(() => window.scrollY).toBe(2000);
  expect(nav().getBoundingClientRect().top).toBe(0);
});

it('links scroll inside it while brand and footer stay put', async () => {
  render(<Layout extraLinks={40} />);
  const area = scroller();
  expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
  expect(area).not.toHaveAttribute('tabindex');
  const brand = screen.getByRole('link', { name: 'Acme' });
  const footer = screen.getByRole('button', { name: 'Sign out' });
  const brandTop = brand.getBoundingClientRect().top;
  area.scrollTop = 300;
  await expect.poll(() => area.scrollTop).toBe(300);
  expect(brand.getBoundingClientRect().top).toBe(brandTop);
  expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(768);
  expect(footer.getBoundingClientRect().bottom).toBeGreaterThan(700);
});

it('sticky={false} scrolls with the page, at its content height', async () => {
  render(<Layout sticky={false} />);
  expect(nav().getBoundingClientRect().height).toBeLessThan(768);
  window.scrollTo(0, 2000);
  await expect.poll(() => window.scrollY).toBe(2000);
  expect(nav().getBoundingClientRect().top).toBeLessThan(0);
});

it('is size.sidebar wide, with surface colors and an end border', () => {
  render(<Layout />);
  const style = getComputedStyle(nav());
  expect(nav().getBoundingClientRect().width).toBe(240);
  expect(style.borderRightStyle).toBe('solid');
  expect(style.borderRightWidth).toBe('1px');
  expect(style.borderLeftStyle).toBe('none');
  expect(style.borderTopLeftRadius).toBe('0px');
});

it('the end border is on the left in RTL', () => {
  document.documentElement.dir = 'rtl';
  render(<Layout />);
  const style = getComputedStyle(nav());
  expect(style.borderLeftStyle).toBe('solid');
  expect(style.borderRightStyle).toBe('none');
});

it('collapsed without collapsible has no rail, since nothing could expand it', () => {
  render(<Layout collapsed />);
  expect(nav()).not.toHaveAttribute('data-collapsed');
  expect(nav().getBoundingClientRect().width).toBe(240);
});

it('links are 32px tall', () => {
  render(<Layout />);
  expect(link('Settings').getBoundingClientRect().height).toBe(32);
});

it('collapsed: the rail is size.sidebarRail wide, shows icons only, and names do not change', async () => {
  render(<Layout collapsible defaultCollapsed />);
  expect(await axNames('link')).toEqual([
    'Acme',
    'Dashboard',
    'Customers 12',
    'Settings',
  ]);
  expect(nav().getBoundingClientRect().width).toBe(56);
  const text = within(link('Dashboard')).getByText('Dashboard');
  expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  const svg = link('Dashboard').querySelector('svg')!;
  expect(svg.getBoundingClientRect().width).toBeGreaterThan(0);
  const linkBox = link('Dashboard').getBoundingClientRect();
  expect(linkBox.right).toBeLessThanOrEqual(56);
});

it('collapsed: group labels are visually hidden and still name their lists', async () => {
  render(<Layout collapsible defaultCollapsed />);
  const label = within(nav()).getByText('Workspace');
  expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  // Chrome exposes the CSS uppercase in the name, as for table headers.
  expect((await axNames('list')).map((name) => name?.toLowerCase())).toContain(
    'workspace',
  );
});

it('collapsed: a badge becomes a dot, with its count visually hidden', async () => {
  const { unmount } = render(<Layout collapsible />);
  // Found by href, so a changed name fails at the name check, not here.
  const count = () =>
    within(nav().querySelector<HTMLElement>('a[href="#customers"]')!).getByText(
      '12',
    );
  expect(count().getBoundingClientRect().width).toBeGreaterThan(1);
  unmount();
  render(<Layout collapsible defaultCollapsed />);
  expect(count().getBoundingClientRect().width).toBeLessThanOrEqual(1);
  const holder = count().closest('[data-sidebar-badge]')!;
  const dot = getComputedStyle(holder, '::after');
  expect(dot.content).toBe('""');
  expect(parseFloat(dot.width)).toBeGreaterThan(0);
  expect(await axNames('link')).toContain('Customers 12');
});

it('collapsed: hover and focus show a tooltip with the link text', async () => {
  render(
    <>
      <button type="button">Before</button>
      <Layout collapsible defaultCollapsed />
    </>,
  );
  await userEvent.hover(link('Settings'));
  await expect
    .poll(() => document.querySelector('[data-side]')?.textContent, {
      timeout: 2000,
    })
    .toBe('Settings');
  await userEvent.unhover(link('Settings'));
  await expect.poll(() => document.querySelector('[data-side]')).toBeNull();
  screen.getByRole('button', { name: 'Before' }).focus();
  // Brand, then the collapse button, then the first link.
  await userEvent.keyboard('{Tab}{Tab}{Tab}');
  expect(link('Dashboard')).toHaveFocus();
  await expect
    .poll(() => document.querySelector('[data-side]')?.textContent)
    .toBe('Dashboard');
});

it('expanded: links show no tooltip', async () => {
  render(<Layout collapsible />);
  link('Settings').focus();
  await userEvent.hover(link('Settings'));
  await new Promise((resolve) => setTimeout(resolve, 800));
  expect(document.querySelector('[data-side]')).toBeNull();
});

it('the width animates, and reduced motion turns it off', async () => {
  render(<Layout collapsible />);
  expect(getComputedStyle(nav()).transitionProperty).toContain('inline-size');
  expect(Math.max(...durations(nav()))).toBeGreaterThan(0);
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  expect(durations(nav()).every((d) => d === 0)).toBe(true);
});

it('the active link has a start bar that uses Highlight in forced colors', async () => {
  render(<Layout />);
  const bar = () => getComputedStyle(link('Dashboard'), '::before');
  expect(bar().borderLeftStyle).toBe('solid');
  expect(bar().borderLeftWidth).toBe('2px');
  expect(
    getComputedStyle(link('Settings'), '::before').borderLeftStyle,
  ).not.toBe('solid');
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  expect(bar().borderLeftColor).toBe(systemColor('Highlight'));
});

it('the focus ring is inset, so the scrolling area does not clip it', async () => {
  render(
    <>
      <button type="button">Before</button>
      <Layout />
    </>,
  );
  screen.getByRole('button', { name: 'Before' }).focus();
  await userEvent.keyboard('{Tab}{Tab}');
  const target = link('Dashboard');
  expect(target).toHaveFocus();
  const style = getComputedStyle(target);
  expect(style.outlineStyle).toBe('solid');
  const reach =
    parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
  expect(reach).toBeLessThanOrEqual(0);
});

it('the collapse button sits in the top section and its chevron flips in RTL', () => {
  const { unmount } = render(<Layout collapsible />);
  const button = collapseButton();
  expect(button.checkVisibility()).toBe(true);
  expect(button.compareDocumentPosition(scroller())).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const ltr = getComputedStyle(button.querySelector('svg')!).transform;
  unmount();
  document.documentElement.dir = 'rtl';
  render(<Layout collapsible />);
  const rtl = getComputedStyle(
    collapseButton().querySelector('svg')!,
  ).transform;
  expect(ltr).toBe('none');
  expect(rtl).toBe('matrix(-1, 0, 0, 1, 0, 0)');
});

it('links work before hydration', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(<Layout collapsible />);
  try {
    const anchor = [...container.querySelectorAll('a')].find(
      (a) => a.textContent === 'Settings',
    )!;
    expect(anchor.checkVisibility()).toBe(true);
    await userEvent.click(anchor);
    expect(location.hash).toBe('#settings');
  } finally {
    container.remove();
    history.replaceState(null, '', location.pathname + location.search);
  }
});

describe('below md', () => {
  const menu = () =>
    document.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!;
  const dialog = () => screen.getByRole('dialog', { name: 'Menu' });
  const drawerNav = () =>
    within(dialog()).getByRole('navigation', { name: 'Main' });
  const drawerLink = (name: string) =>
    within(drawerNav()).getByRole('link', { name });
  const open = async () => {
    await userEvent.click(menu());
    await expect.poll(() => screen.queryByRole('dialog')).not.toBeNull();
    // Settled once the slide-in transform is the identity.
    await expect
      .poll(() =>
        ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(
          getComputedStyle(dialog()).transform,
        ),
      )
      .toBe(true);
  };
  const closed = () =>
    expect.poll(() => screen.queryByRole('dialog')).toBeNull();

  beforeEach(async () => {
    await page.viewport(375, 700);
  });

  it('shows a bar with brand and a Menu button, with no landmark, and hides the side nav', () => {
    render(<Layout />);
    expect(menu().checkVisibility()).toBe(true);
    const bar = menu().parentElement!;
    expect(
      within(bar).getByRole('link', { name: 'Acme' }).checkVisibility(),
    ).toBe(true);
    expect(bar.closest('nav, header, aside, [role]')).toBeNull();
    expect(
      screen.getByRole('navigation', { hidden: true }).checkVisibility(),
    ).toBe(false);
  });

  it('each link is in the accessibility tree once, closed and open', async () => {
    render(<Layout />);
    expect(await axNames('link')).toEqual(['Acme']);
    await open();
    expect(await axNames('link')).toEqual([
      'Acme',
      'Dashboard',
      'Customers 12',
      'Settings',
    ]);
  });

  it('the drawer has brand, a close button, the links in a nav named by aria-label, and footer', async () => {
    render(<Layout />);
    await open();
    expect(within(dialog()).getByRole('link', { name: 'Acme' })).toBeVisible();
    expect(
      within(dialog()).getByRole('button', { name: 'Close' }),
    ).toBeVisible();
    expect(drawerLink('Settings')).toBeVisible();
    expect(
      within(dialog()).getByRole('button', { name: 'Sign out' }),
    ).toBeVisible();
  });

  it('labels.close names the close button', async () => {
    render(<Layout labels={{ close: 'Dismiss' }} />);
    await open();
    expect(
      within(dialog()).getByRole('button', { name: 'Dismiss' }),
    ).toBeVisible();
  });

  it('menuLabel names the menu button and the drawer', async () => {
    render(<Layout menuLabel="Navigation" />);
    const button = screen.getByRole('button', { name: 'Navigation' });
    await userEvent.click(button);
    expect(
      await screen.findByRole('dialog', { name: 'Navigation' }),
    ).toBeInTheDocument();
  });

  it('opening traps focus and locks page scrolling', async () => {
    render(<Layout />);
    await open();
    expect(dialog().contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab();
      expect(dialog().contains(document.activeElement)).toBe(true);
    }
    const root = getComputedStyle(document.documentElement);
    expect(
      [root.overflowY, getComputedStyle(document.body).overflowY].includes(
        'hidden',
      ),
    ).toBe(true);
  });

  it('the menu button has data-open while the drawer is open', async () => {
    render(<Layout />);
    expect(menu()).not.toHaveAttribute('data-open');
    await open();
    expect(menu()).toHaveAttribute('data-open');
  });

  const closers = {
    'a plain link click': () => userEvent.click(drawerLink('Settings')),
    Escape: () => userEvent.keyboard('{Escape}'),
    'the close button': () =>
      userEvent.click(within(dialog()).getByRole('button', { name: 'Close' })),
    'a backdrop click': () =>
      userEvent.click(document.body, { position: { x: 370, y: 350 } }),
  };

  it.each(Object.entries(closers))(
    '%s closes it and returns focus to the menu button',
    async (_name, close) => {
      render(<Layout />);
      await open();
      await close();
      await closed();
      await expect.poll(() => document.activeElement).toBe(menu());
      expect(menu()).not.toHaveAttribute('data-open');
    },
  );

  // Review Focus 1.
  // Dispatched, since a real Control click on macOS opens the context menu
  // and sends no click at all.
  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'])(
    'a click with %s on a link leaves it open',
    async (key) => {
      render(<Layout />);
      await open();
      const restore = stopNavigation();
      try {
        drawerLink('Settings').dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
            [key]: true,
          }),
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(screen.queryByRole('dialog')).not.toBeNull();
      } finally {
        restore();
      }
    },
  );

  it('a link with target="_blank" leaves it open', async () => {
    render(<Layout />);
    await open();
    // The fixture's links don't set target, so it's added here.
    const link = drawerLink('Settings');
    link.setAttribute('target', '_blank');
    const restore = stopNavigation();
    try {
      await userEvent.click(link);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(screen.queryByRole('dialog')).not.toBeNull();
    } finally {
      restore();
    }
  });

  it('a link click the project cancels leaves it open', async () => {
    render(<Layout />);
    await open();
    const link = drawerLink('Settings');
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('link targets are at least 44px tall', async () => {
    render(<Layout />);
    await open();
    expect(drawerLink('Settings').getBoundingClientRect().height).toBe(44);
  });

  // Review Focus 2.
  it('a controlled collapsed sidebar shows link text in the drawer, with tooltips off', async () => {
    render(<Layout collapsible collapsed />);
    await open();
    const text = within(drawerLink('Settings')).getByText('Settings');
    expect(text.getBoundingClientRect().width).toBeGreaterThan(1);
    expect(
      within(dialog()).getByText('Workspace').getBoundingClientRect().width,
    ).toBeGreaterThan(1);
    drawerLink('Settings').focus();
    await userEvent.hover(drawerLink('Settings'));
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Tooltips mark their popup with data-side; the drawer's own popup does too.
    const tooltips = [...document.querySelectorAll('[data-side]')].filter(
      (element) => !element.closest('[role="dialog"]'),
    );
    expect(tooltips).toEqual([]);
  });

  it('the drawer is size.sidebar wide and opens from the start edge, in LTR and RTL', async () => {
    const { unmount } = render(<Layout />);
    await open();
    let panel = drawerNav().getBoundingClientRect();
    expect(panel.left).toBeLessThan(40);
    // The panel's visible edge; its bleed runs off-screen past the start.
    expect(dialog().getBoundingClientRect().right).toBe(240);
    await userEvent.keyboard('{Escape}');
    await closed();
    unmount();
    document.documentElement.dir = 'rtl';
    render(<Layout />);
    await open();
    panel = drawerNav().getBoundingClientRect();
    expect(panel.right).toBeGreaterThan(335);
    expect(dialog().getBoundingClientRect().left).toBe(375 - 240);
  });

  it('growing the window past md closes it', async () => {
    render(<Layout />);
    await open();
    await page.viewport(1024, 700);
    await closed();
    // The menu button is hidden now, so focus goes to the side nav instead.
    await expect
      .poll(() => document.activeElement)
      .toBe(within(nav()).getByRole('link', { name: 'Acme' }));
  });

  it('sticky keeps the bar at the top; sticky={false} scrolls it away', async () => {
    const { unmount } = render(<Layout />);
    window.scrollTo(0, 1000);
    await expect.poll(() => window.scrollY).toBe(1000);
    expect(menu().parentElement!.getBoundingClientRect().top).toBe(0);
    unmount();
    window.scrollTo(0, 0);
    render(<Layout sticky={false} />);
    window.scrollTo(0, 1000);
    await expect.poll(() => window.scrollY).toBe(1000);
    expect(menu().parentElement!.getBoundingClientRect().top).toBeLessThan(0);
  });
});
