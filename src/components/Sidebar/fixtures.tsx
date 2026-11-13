import type { SVGProps } from 'react';
import { Badge } from '../Badge';
import { Icon } from '../Icon';
import { Sidebar, SidebarGroup, SidebarLink, type SidebarProps } from './index';

/** A stand-in icon, so tests don't depend on an icon package. */
export function SquareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="4" y="4" width="16" height="16" />
    </svg>
  );
}

export const icon = <Icon icon={SquareIcon} />;

/** A sidebar with a named group, an unnamed group, an active link, and a badge. */
export function App({
  extraLinks = 0,
  ...props
}: Partial<SidebarProps> & { extraLinks?: number }) {
  return (
    <Sidebar
      aria-label="Main"
      brand={<a href="#home">Acme</a>}
      footer={<button type="button">Sign out</button>}
      {...props}
    >
      <SidebarGroup label="Workspace">
        <SidebarLink href="#dashboard" active startIcon={icon}>
          Dashboard
        </SidebarLink>
        <SidebarLink
          href="#customers"
          startIcon={icon}
          badge={<Badge>12</Badge>}
        >
          Customers
        </SidebarLink>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarLink href="#settings" startIcon={icon}>
          Settings
        </SidebarLink>
        {Array.from({ length: extraLinks }, (_, index) => (
          <SidebarLink key={index} href={`#page-${index}`} startIcon={icon}>
            {`Page ${index}`}
          </SidebarLink>
        ))}
      </SidebarGroup>
    </Sidebar>
  );
}
