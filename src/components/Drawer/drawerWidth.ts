import { vars } from '../../themes/contract.css';

/** How far the panel extends past the screen edge, so overshooting a swipe shows no gap. */
export const bleed = vars.space['12'];
/** Clear space left beside a side panel, so there is always backdrop to tap. */
export const gutter = vars.space['8'];

/**
 * A side panel's width: the visible width, never more than the viewport less
 * the gutter, plus the bleed. Outside `Drawer.css.ts`, which can only export
 * styles, so `Sidebar`'s drawer can use it too.
 */
export const drawerWidth = (token: string) =>
  `calc(min(${token}, 100% - ${gutter}) + ${bleed})`;
