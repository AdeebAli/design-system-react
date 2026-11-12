'use client';

import { MenuContent, type MenuContentProps } from './MenuContent';

/** `MenuSubmenuContent`'s props. */
export type MenuSubmenuContentProps = Omit<MenuContentProps, 'side' | 'align'>;

/**
 * The submenu's popup. It opens beside its trigger, at the inline end, and
 * flips to stay on screen. It looks like `MenuContent`.
 */
export function MenuSubmenuContent(props: MenuSubmenuContentProps) {
  return <MenuContent {...props} side="end" align="start" />;
}
