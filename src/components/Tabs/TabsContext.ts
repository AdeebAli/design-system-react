'use client';

import { createContext, useContext } from 'react';

/** Tab styles. `pill` marks the selected tab with a rounded ring. */
export type TabsVariant = 'underline' | 'pill';
/** Tab heights: 28px (`sm`) and 36px (`md`). */
export type TabsSize = 'sm' | 'md';

export const TabsContext = createContext<{
  variant: TabsVariant;
  size: TabsSize;
}>({ variant: 'underline', size: 'md' });

export function useTabsStyle() {
  return useContext(TabsContext);
}
