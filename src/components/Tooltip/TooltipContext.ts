import { createContext } from 'react';

/** The provider's default `delay`, or `undefined` outside a `TooltipProvider`. */
export const TooltipDelayContext = createContext<number | undefined>(undefined);
