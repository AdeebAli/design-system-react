'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useEffect, type ComponentPropsWithRef, type RefObject } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { box } from '../Box';
import { gapOffset, toBaseSide } from '../overlays/positioning';
import type { OverlayAlign, OverlaySide } from '../overlays/positioning';
import { popupMotion, popupSurface, positioner } from '../overlays/popup.css';
import { usePopoverContext } from './PopoverContext';
import * as styles from './Popover.css';

interface PopoverContentOwnProps {
  /** Which side of the trigger it opens on. It flips near the viewport edge. @default 'bottom' */
  side?: OverlaySide;
  /** How it lines up with the trigger along that side. @default 'center' */
  align?: OverlayAlign;
  /** Adds an arrow pointing at the trigger. @default false */
  arrow?: boolean;
  /** What gets focus on open. Unset, the first focusable element (the popup on touch). */
  initialFocus?: RefObject<HTMLElement | null>;
}

/** `PopoverContent`'s props. */
export type PopoverContentProps = ComponentProps<
  'div',
  PopoverContentOwnProps
> &
  Pick<ComponentPropsWithRef<'div'>, 'aria-label'>;

/** The popover's popup, rendered in a portal next to the trigger. */
export function PopoverContent({
  side = 'bottom',
  align = 'center',
  arrow = false,
  initialFocus,
  className,
  children,
  ...props
}: PopoverContentProps) {
  const [layout, rest] = splitLayoutProps(props);
  const labelled = Boolean(rest['aria-label'] ?? rest['aria-labelledby']);
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={toBaseSide(side)}
        align={align}
        sideOffset={gapOffset}
        className={positioner}
      >
        <BasePopover.Popup
          {...rest}
          initialFocus={initialFocus}
          className={cx(
            popupSurface,
            popupMotion,
            styles.popup,
            box(layout),
            className,
          )}
        >
          {children}
          {arrow && <BasePopover.Arrow className={styles.arrow} />}
          <Checks labelled={labelled} />
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/**
 * Warns about a missing name. It renders inside the popup, so it only runs
 * while the popover is open, and after `PopoverTitle` has registered itself.
 */
function Checks({ labelled }: { labelled: boolean }) {
  const { hasTitle } = usePopoverContext('PopoverContent');
  useEffect(() => {
    if (!hasTitle() && !labelled) {
      warnOnce(
        'popover-name',
        'PopoverContent: the popover has no name. Add a `PopoverTitle`, or give `PopoverContent` an `aria-label`.',
      );
    }
  }, [labelled, hasTitle]);
  return null;
}
