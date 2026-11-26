'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useEffect, type ComponentPropsWithRef, type RefObject } from 'react';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { gapOffset, toBaseSide } from '../overlays/positioning';
import { popupMotion, popupSurface, positioner } from '../overlays/popup.css';
import { usePopoverContext } from './PopoverContext';
import * as styles from './Popover.css';

interface PopoverContentOwnProps {
  /**
   * Which side of the trigger it opens on. It flips near the viewport edge. One
   * of `'top'`, `'bottom'`, `'start'`, or `'end'`.
   * @default 'bottom'
   */
  side?: 'top' | 'bottom' | 'start' | 'end';
  /**
   * How it lines up with the trigger along that side. One of `'start'`,
   * `'center'`, or `'end'`.
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
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
  const grid = layoutStyle(layout, rest.style, 'PopoverContent');
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
          style={grid.style}
          initialFocus={initialFocus}
          className={cx(
            popupSurface,
            popupMotion,
            styles.popup,
            grid.className,
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
