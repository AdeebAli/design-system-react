'use client';

import { createContext, useContext } from 'react';

/** What an `AccordionItem` needs from its `Accordion`. */
export interface AccordionContextValue {
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
  size: 'sm' | 'md';
  keepMounted: boolean;
}

export const AccordionContext = createContext<AccordionContextValue>({
  headingLevel: 3,
  size: 'md',
  keepMounted: false,
});

export const useAccordion = () => useContext(AccordionContext);
