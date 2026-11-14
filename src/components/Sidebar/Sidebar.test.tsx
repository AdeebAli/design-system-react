import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { renderToString } from 'react-dom/server';
import { App, icon } from './fixtures';
import { Sidebar, SidebarGroup, SidebarLink } from './index';

const nav = () => screen.getByRole('navigation', { name: 'Main' });
const link = (name: string) => within(nav()).getByRole('link', { name });

it('renders a nav named by aria-label', () => {
  render(<App />);
  expect(nav().tagName).toBe('NAV');
});

it('a labeled group is a ul named by its label', () => {
  render(<App />);
  const list = within(nav()).getByRole('list', { name: 'Workspace' });
  expect(list.tagName).toBe('UL');
  const labelId = list.getAttribute('aria-labelledby')!;
  expect(document.getElementById(labelId)).toHaveTextContent('Workspace');
});

it('an unlabeled group is an unnamed ul', () => {
  render(<App />);
  const lists = within(nav()).getAllByRole('list');
  expect(lists).toHaveLength(2);
  expect(lists[1]!.tagName).toBe('UL');
  expect(lists[1]).not.toHaveAttribute('aria-labelledby');
  expect(lists[1]).not.toHaveAttribute('aria-label');
});

it('SidebarLink renders an li holding an a', () => {
  render(<App />);
  const dashboard = link('Dashboard');
  expect(dashboard.tagName).toBe('A');
  expect(dashboard.parentElement!.tagName).toBe('LI');
  expect(dashboard).toHaveAttribute('href', '#dashboard');
});

it('active sets aria-current and data-active', () => {
  render(<App />);
  expect(link('Dashboard')).toHaveAttribute('aria-current', 'page');
  expect(link('Dashboard')).toHaveAttribute('data-active');
  expect(link('Settings')).not.toHaveAttribute('aria-current');
  expect(link('Settings')).not.toHaveAttribute('data-active');
});

it('as renders the router link', () => {
  const RouterLink = forwardRef<
    HTMLAnchorElement,
    ComponentPropsWithoutRef<'a'>
  >(function RouterLink({ children, ...props }, ref) {
    return (
      <a ref={ref} data-router="" {...props}>
        {children}
      </a>
    );
  });
  render(
    <Sidebar aria-label="Main">
      <SidebarGroup>
        <SidebarLink as={RouterLink} href="#x" startIcon={icon}>
          Routed
        </SidebarLink>
      </SidebarGroup>
    </Sidebar>,
  );
  expect(link('Routed')).toHaveAttribute('data-router');
});

it('outside a Sidebar, SidebarLink warns once and renders without an li', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <ul>
      <SidebarLink href="#a">Alone</SidebarLink>
    </ul>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/SidebarLink.*Sidebar/);
  expect(
    screen.getByRole('link', { name: 'Alone' }).parentElement!.tagName,
  ).toBe('UL');
  warn.mockRestore();
});

it('under collapsible, a link with no startIcon warns once', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <Sidebar aria-label="Plain">
      <SidebarGroup>
        <SidebarLink href="#a">No icon, not collapsible</SidebarLink>
      </SidebarGroup>
    </Sidebar>,
  );
  expect(warn).not.toHaveBeenCalled();
  render(
    <Sidebar aria-label="Main" collapsible>
      <SidebarGroup>
        <SidebarLink href="#a">No icon</SidebarLink>
        <SidebarLink href="#b" startIcon={icon}>
          Icon
        </SidebarLink>
      </SidebarGroup>
    </Sidebar>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/startIcon/);
  warn.mockRestore();
});

it('the collapse button is named by its action, with no aria-expanded', async () => {
  render(<App collapsible />);
  const button = within(nav()).getByRole('button', {
    name: 'Collapse sidebar',
  });
  expect(button).not.toHaveAttribute('aria-expanded');
  await userEvent.click(button);
  expect(button).toHaveAccessibleName('Expand sidebar');
  expect(button).not.toHaveAttribute('aria-expanded');
});

it('labels rename the collapse button', async () => {
  render(<App collapsible labels={{ collapse: 'Shrink', expand: 'Grow' }} />);
  await userEvent.click(within(nav()).getByRole('button', { name: 'Shrink' }));
  expect(within(nav()).getByRole('button', { name: 'Grow' })).toBeVisible();
});

it('without collapsible there is no collapse button', () => {
  render(<App />);
  expect(within(nav()).queryByRole('button', { name: /sidebar/ })).toBeNull();
});

it('uncontrolled: defaultCollapsed starts collapsed, the button toggles it, and onCollapsedChange gets only the value', async () => {
  const onCollapsedChange = vi.fn();
  render(
    <App collapsible defaultCollapsed onCollapsedChange={onCollapsedChange} />,
  );
  expect(nav()).toHaveAttribute('data-collapsed');
  await userEvent.click(
    within(nav()).getByRole('button', { name: 'Expand sidebar' }),
  );
  expect(nav()).not.toHaveAttribute('data-collapsed');
  expect(onCollapsedChange.mock.calls).toEqual([[false]]);
});

it('controlled: collapsed decides, and a click only reports', async () => {
  const onCollapsedChange = vi.fn();
  const { rerender } = render(
    <App collapsible collapsed={false} onCollapsedChange={onCollapsedChange} />,
  );
  await userEvent.click(
    within(nav()).getByRole('button', { name: 'Collapse sidebar' }),
  );
  expect(onCollapsedChange.mock.calls).toEqual([[true]]);
  expect(nav()).not.toHaveAttribute('data-collapsed');
  rerender(<App collapsible collapsed onCollapsedChange={onCollapsedChange} />);
  expect(nav()).toHaveAttribute('data-collapsed');
});

it('data-collapsed is in the server HTML', () => {
  const collapsed = renderToString(<App collapsible defaultCollapsed />);
  expect(collapsed).toMatch(/<nav[^>]*data-collapsed=""/);
  const expanded = renderToString(<App collapsible />);
  expect(expanded).not.toMatch(/data-collapsed/);
});

it('without collapsible, collapsed and defaultCollapsed have no effect, even in the server HTML', () => {
  expect(renderToString(<App defaultCollapsed />)).not.toMatch(
    /data-collapsed/,
  );
  render(<App collapsed />);
  expect(nav()).not.toHaveAttribute('data-collapsed');
});

it('toggling keeps focus on the button and keeps the same link nodes', async () => {
  render(<App collapsible />);
  const before = link('Dashboard');
  const button = within(nav()).getByRole('button', {
    name: 'Collapse sidebar',
  });
  await userEvent.click(button);
  expect(button).toHaveFocus();
  expect(link('Dashboard')).toBe(before);
  await userEvent.keyboard('{Enter}');
  expect(nav()).not.toHaveAttribute('data-collapsed');
  expect(button).toHaveFocus();
  expect(link('Dashboard')).toBe(before);
});

it('link text and group labels stay in the DOM when collapsed', () => {
  render(<App collapsible defaultCollapsed />);
  expect(link('Dashboard')).toHaveTextContent('Dashboard');
  expect(
    within(nav()).getByRole('list', { name: 'Workspace' }),
  ).toBeInTheDocument();
  // jsdom joins the flex items' text without a space; the browser test checks Chrome's name.
  expect(
    within(nav()).getByRole('link', { name: /^Customers\s*12$/ }),
  ).toBeInTheDocument();
});

it('accepts layout props', () => {
  render(<App marginTop="4" />);
  const withLayout = nav().className;
  render(<Sidebar aria-label="Plain" />);
  expect(screen.getByRole('navigation', { name: 'Plain' }).className).not.toBe(
    withLayout,
  );
});

it('the menu opens the drawer where matchMedia is missing, as in jsdom', async () => {
  expect(typeof window.matchMedia).toBe('undefined');
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  expect(await screen.findByRole('dialog', { name: 'Menu' })).toBeVisible();
});
