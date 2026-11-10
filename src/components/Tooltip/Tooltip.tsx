'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useContext, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { gapOffset, toBaseSide } from '../overlays/positioning';
import type { OverlayAlign, OverlaySide } from '../overlays/positioning';
import { popupMotion } from '../overlays/popup.css';
import { TooltipDelayContext } from './TooltipContext';
import * as styles from './Tooltip.css';

/** `Tooltip`'s props. */
export interface TooltipProps {
  /** The hint. Visual only: it isn't announced, so don't put needed information here. */
  content: ReactNode;
  /** The one element it describes. Any focusable element, such as a `Link`. */
  children: ReactElement;
  /** Which side of the trigger it opens on. It flips near the viewport edge. @default 'top' */
  side?: OverlaySide;
  /** How it lines up with the trigger along that side. @default 'center' */
  align?: OverlayAlign;
  /** Hover delay in ms. Keyboard focus opens it immediately. @default `TooltipProvider`'s `delay`, otherwise 600 */
  delay?: number;
  /** Whether it's open, when controlled. */
  open?: boolean;
  /** Whether it starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the new open state. To block closing, control `open`. */
  onOpenChange?: (open: boolean) => void;
  /** Turns the tooltip off. @default false */
  disabled?: boolean;
}

/**
 * A short text hint on hover or keyboard focus. It adds no ARIA, so the
 * trigger needs its own name. A natively `disabled` button never opens it.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delay,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
}: TooltipProps) {
  const providerDelay = useContext(TooltipDelayContext);
  return (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      disabled={disabled}
    >
      <BaseTooltip.Trigger
        delay={delay ?? providerDelay ?? 600}
        render={children}
      />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={toBaseSide(side)}
          align={align}
          sideOffset={gapOffset}
          className={styles.positioner}
        >
          <BaseTooltip.Popup className={cx(popupMotion, styles.popup)}>
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
