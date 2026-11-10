import { render, screen, within } from '@testing-library/react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { IconButton } from '../IconButton';
import { NavBar, NavBarLink } from './index';
import * as styles from './NavBar.css';

// The closed panel is hidden here, since jsdom has no media queries; the
// browser tests check what's visible at each width.
const hidden = { hidden: true };

it('renders a named nav with one list, each link in an li, including through a fragment', () => {
  render(
    <NavBar aria-label="Main">
      <>
        <NavBarLink href="/a">A</NavBarLink>
        <NavBarLink href="/b">B</NavBarLink>
      </>
    </NavBar>,
  );
  const nav = screen.getByRole('navigation', { name: 'Main' });
  const lists = within(nav).getAllByRole('list', hidden);
  expect(lists).toHaveLength(1);
  const items = within(lists[0]!).getAllByRole('listitem', hidden);
  expect(items).toHaveLength(2);
  expect(
    within(items[0]!).getByRole('link', { name: 'A', ...hidden }),
  ).toHaveAttribute('href', '/a');
});

it('active sets aria-current="page" and data-active', () => {
  render(
    <NavBar aria-label="Main">
      <NavBarLink href="/a" active>
        A
      </NavBarLink>
      <NavBarLink href="/b">B</NavBarLink>
    </NavBar>,
  );
  const a = screen.getByRole('link', { name: 'A', ...hidden });
  expect(a).toHaveAttribute('aria-current', 'page');
  expect(a).toHaveAttribute('data-active');
  const b = screen.getByRole('link', { name: 'B', ...hidden });
  expect(b).not.toHaveAttribute('aria-current');
  expect(b).not.toHaveAttribute('data-active');
});

it('as renders the given component with href and active', () => {
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
    <NavBar aria-label="Main">
      <NavBarLink as={RouterLink} href="/c" active>
        C
      </NavBarLink>
    </NavBar>,
  );
  const link = screen.getByRole('link', { name: 'C', ...hidden });
  expect(link).toHaveAttribute('data-router');
  expect(link).toHaveAttribute('href', '/c');
  expect(link).toHaveAttribute('aria-current', 'page');
});

it('startIcon is decorative', () => {
  render(
    <NavBar aria-label="Main">
      <NavBarLink href="/a" startIcon={<Icon icon={ArrowUpIcon} />}>
        A
      </NavBarLink>
    </NavBar>,
  );
  const link = screen.getByRole('link', { name: 'A', ...hidden });
  expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('brand and actions render outside the list', () => {
  render(
    <NavBar
      aria-label="Main"
      brand={<a href="/">Acme</a>}
      actions={<button type="button">Sign in</button>}
    >
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  const list = screen.getByRole('list', hidden);
  const nav = screen.getByRole('navigation');
  for (const el of [
    screen.getByRole('link', { name: 'Acme' }),
    screen.getByRole('button', { name: 'Sign in' }),
  ]) {
    expect(nav).toContainElement(el);
    expect(list).not.toContainElement(el);
  }
});

it('outside a NavBar, NavBarLink warns once and renders without an li', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <>
      <NavBarLink href="/a">A</NavBarLink>
      <NavBarLink href="/b">B</NavBarLink>
    </>,
  );
  expect(screen.queryByRole('listitem')).toBeNull();
  expect(
    screen.getByRole('link', { name: 'A', ...hidden }),
  ).toBeInTheDocument();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/NavBarLink/);
  warn.mockRestore();
});

it('the menu button is named by menuLabel, defaulting to "Menu"', () => {
  const { rerender } = render(
    <NavBar aria-label="Main">
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  rerender(
    <NavBar aria-label="Main" menuLabel="Navigation">
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  expect(
    screen.getByRole('button', { name: 'Navigation' }),
  ).toBeInTheDocument();
});

it('sticky applies the sticky class', () => {
  const { rerender } = render(
    <NavBar aria-label="Main">
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).not.toHaveClass(styles.sticky);
  rerender(
    <NavBar aria-label="Main" sticky>
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  expect(nav).toHaveClass(styles.sticky);
});

it('className, style, and layout props go on the nav', () => {
  render(
    <NavBar
      aria-label="Main"
      className="extra"
      style={{ color: 'red' }}
      marginTop="4"
    >
      <NavBarLink href="/a">A</NavBarLink>
    </NavBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('extra');
  expect(nav.style.color).toBe('red');
});

it.each(['ghost', 'solid', 'soft', 'outline'] as const)(
  'menuVariant="%s" styles the menu button as that IconButton variant',
  (variant) => {
    render(
      <>
        <NavBar aria-label="Main" menuVariant={variant} />
        <IconButton
          data-testid="reference"
          icon={<Icon icon={ArrowUpIcon} />}
          aria-label="Reference"
          variant={variant}
          size="md"
        />
      </>,
    );
    const menu = document.querySelector('button[aria-label="Menu"]')!;
    const reference = screen.getByTestId('reference');
    for (const name of reference.classList)
      expect(menu.classList, name).toContain(name);
  },
);

it('the menu button is ghost by default', () => {
  render(<NavBar aria-label="Main" />);
  const ghost = document.querySelector('button[aria-label="Menu"]')!.className;
  render(<NavBar aria-label="Other" menuVariant="outline" />);
  const outline = document.querySelectorAll('button[aria-label="Menu"]')[1]!
    .className;
  expect(ghost).not.toBe(outline);
});
