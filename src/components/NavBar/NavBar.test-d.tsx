import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { NavBar, NavBarLink } from './index';

const RouterLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'> & { prefetch?: boolean }
>(function RouterLink({ children, ...props }, ref) {
  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
});

test('aria-label is required', () => {
  <NavBar aria-label="Main" />;
  // @ts-expect-error aria-label is required
  <NavBar />;
});

test('NavBarLink accepts its component props through as', () => {
  <NavBarLink as={RouterLink} href="/a" prefetch active />;
  // @ts-expect-error prefetch must be a boolean
  <NavBarLink as={RouterLink} href="/a" prefetch="yes" />;
  // @ts-expect-error active is a boolean
  <NavBarLink href="/a" active="yes" />;
});
