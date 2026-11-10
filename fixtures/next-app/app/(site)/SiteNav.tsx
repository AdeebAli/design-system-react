import { Link, NavBar, NavBarLink } from '@adeebali/design-system-react';
import NextLink from './NextLink';

// A server component: it passes next/link through `as` to a client NavBarLink.
export function SiteNav() {
  return (
    <NavBar
      aria-label="Main"
      sticky
      brand={
        <Link as={NextLink} href="/" tone="neutral" underline="hover">
          Fixture
        </Link>
      }
    >
      <NavBarLink as={NextLink} href="/">
        Home
      </NavBarLink>
      <NavBarLink as={NextLink} href="/blog">
        Blog
      </NavBarLink>
    </NavBar>
  );
}
