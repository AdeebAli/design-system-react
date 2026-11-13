import type { ComponentProps } from 'react';
import { Sidebar, SidebarGroup, SidebarLink } from './index';

function Router({
  children,
  ...props
}: ComponentProps<'a'> & { prefetch?: boolean }) {
  return <a {...props}>{children}</a>;
}

test('aria-label is required', () => {
  <Sidebar aria-label="Main" />;
  // @ts-expect-error aria-label is required
  <Sidebar />;
});

test('props are typed', () => {
  <Sidebar
    aria-label="Main"
    collapsible
    collapsed
    onCollapsedChange={(collapsed: boolean) => void collapsed}
    sticky={false}
    menuLabel="Navigation"
    labels={{ collapse: 'a', expand: 'b', close: 'c' }}
    marginTop="4"
  >
    <SidebarGroup label="Group">
      <SidebarLink as={Router} href="/x" prefetch active>
        X
      </SidebarLink>
    </SidebarGroup>
  </Sidebar>;
  // @ts-expect-error a plain a has no prefetch
  <SidebarLink href="/x" prefetch />;
  // @ts-expect-error a group label is a string
  <SidebarGroup label={<b>Bold</b>} />;
  // @ts-expect-error startIcon is an element
  <SidebarLink href="/x" startIcon="home" />;
});
