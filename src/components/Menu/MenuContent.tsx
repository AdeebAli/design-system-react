'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { gapOffset, toBaseSide } from '../overlays/positioning';
import type { OverlayAlign, OverlaySide } from '../overlays/positioning';
import { popupMotion, popupSurface, positioner } from '../overlays/popup.css';
import * as styles from './Menu.css';

interface MenuContentOwnProps {
  /** Which side of the trigger it opens on. It flips near the viewport edge. @default 'bottom' */
  side?: OverlaySide;
  /** How it lines up with the trigger along that side. @default 'start' */
  align?: OverlayAlign;
}

/** `MenuContent`'s props. */
export type MenuContentProps = ComponentProps<'div', MenuContentOwnProps>;

/** The menu's popup, rendered in a portal next to the trigger. Tall menus scroll. */
export function MenuContent({
  side = 'bottom',
  align = 'start',
  className,
  children,
  ...props
}: MenuContentProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side={toBaseSide(side)}
        align={align}
        sideOffset={gapOffset}
        className={positioner}
      >
        <BaseMenu.Popup
          {...rest}
          className={cx(
            popupSurface,
            popupMotion,
            styles.popup,
            box(layout),
            className,
          )}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}
