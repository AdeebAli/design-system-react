'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { useMemo, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Accordion.css';
import {
  AccordionContext,
  type AccordionContextValue,
} from './AccordionContext';

interface AccordionOwnProps {
  /** The open items' values, when controlled. */
  value?: string[];
  /** The items open at first, when uncontrolled. @default [] */
  defaultValue?: string[];
  /** Called with the open items' values. */
  onValueChange?: (value: string[]) => void;
  /** Lets more than one item stay open. @default false */
  multiple?: boolean;
  /** The tag of each item's heading. It doesn't change the look. @default 3 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The header size. @default 'md' */
  size?: 'sm' | 'md';
  /**
   * Keeps closed content in the DOM, such as for form state, hidden until
   * found so the browser's find-in-page can open it. @default false
   */
  keepMounted?: boolean;
  /** `AccordionItem`s. */
  children?: ReactNode;
}

/** `Accordion`'s props. */
export type AccordionProps = ComponentProps<'div', AccordionOwnProps>;

/** Sections that expand in place, such as FAQs and settings. */
export function Accordion({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  headingLevel = 3,
  size = 'md',
  keepMounted = false,
  className,
  children,
  ...props
}: AccordionProps) {
  const [layout, rest] = splitLayoutProps(props);
  const context = useMemo<AccordionContextValue>(
    () => ({ headingLevel, size, keepMounted }),
    [headingLevel, size, keepMounted],
  );
  return (
    <AccordionContext.Provider value={context}>
      <BaseAccordion.Root
        {...rest}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        multiple={multiple}
        className={cx(box(layout), styles.root, className)}
      >
        {children}
      </BaseAccordion.Root>
    </AccordionContext.Provider>
  );
}
