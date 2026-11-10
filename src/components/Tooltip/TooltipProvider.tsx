'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactNode } from 'react';
import { TooltipDelayContext } from './TooltipContext';

/** `TooltipProvider`'s props. */
export interface TooltipProviderProps {
  /** The default `delay` for every tooltip inside, in ms. @default 600 */
  delay?: number;
  children?: ReactNode;
}

/**
 * Optional. Inside one, a second tooltip opens without delay soon after the
 * first closes, so moving along a toolbar feels quick.
 */
export function TooltipProvider({ delay, children }: TooltipProviderProps) {
  return (
    <TooltipDelayContext.Provider value={delay}>
      <BaseTooltip.Provider delay={delay}>{children}</BaseTooltip.Provider>
    </TooltipDelayContext.Provider>
  );
}
