'use client';

import { createContext, useContext, type MouseEvent } from 'react';

/** What `SidebarGroup` and `SidebarLink` need from their `Sidebar`. */
export interface SidebarContextValue {
  /** Whether the rail shows, from `md` up. Always `false` in the drawer. */
  collapsed: boolean;
  /** Whether the sidebar can collapse, so links need icons. */
  collapsible: boolean;
  /** Whether this copy renders in the small-screen drawer. */
  inDrawer: boolean;
  /** Called after a link click, so the drawer can close. */
  onNavigate?(event: MouseEvent<HTMLAnchorElement>): void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

/** The surrounding `Sidebar`'s context, or `null` outside one. */
export function useSidebar(): SidebarContextValue | null {
  return useContext(SidebarContext);
}
