'use client';

import { createContext, useContext } from 'react';

/** What a `NavBarLink` needs from its `NavBar`. */
export interface NavBarContextValue {
  /** Whether the small-screen panel is open. */
  open: boolean;
  /** Closes the panel after a link click, and moves focus to the menu button. */
  closeFromLink(): void;
}

export const NavBarContext = createContext<NavBarContextValue | null>(null);

/** The surrounding `NavBar`'s context, or `null` outside one. */
export function useNavBar(): NavBarContextValue | null {
  return useContext(NavBarContext);
}
