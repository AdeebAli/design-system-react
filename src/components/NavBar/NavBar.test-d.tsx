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

test('menuVariant is a Button variant and menuPosition is start or end', () => {
  <NavBar aria-label="Main" menuVariant="outline" menuPosition="start" />;
  // @ts-expect-error menuVariant is solid, soft, outline, or ghost
  <NavBar aria-label="Main" menuVariant="link" />;
  // @ts-expect-error menuPosition is start or end
  <NavBar aria-label="Main" menuPosition="middle" />;
});
