import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { cdp, page } from 'vitest/browser';
import { NavBar, NavBarLink } from './index';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

function Example({ sticky = false }: { sticky?: boolean }) {
  return (
    <NavBar
      aria-label="Main"
      sticky={sticky}
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

interface FrameTree {
  frame: { id: string };
  childFrames?: FrameTree[];
}

// Tests run in an iframe, so the tree is read from the deepest frame.
async function testFrameId() {
  const { frameTree } = (await cdp().send('Page.getFrameTree')) as {
    frameTree: FrameTree;
  };
  let tree = frameTree;
  while (tree.childFrames?.length) tree = tree.childFrames.at(-1)!;
  return tree.frame.id;
}

async function axLinkNames() {
  const { nodes } = (await cdp().send('Accessibility.getFullAXTree', {
    frameId: await testFrameId(),
  })) as {
    nodes: {
      role?: { value: string };
      name?: { value: string };
      ignored?: boolean;
    }[];
  };
  return nodes
    .filter((node) => !node.ignored && node.role?.value === 'link')
    .map((node) => node.name?.value);
}

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
