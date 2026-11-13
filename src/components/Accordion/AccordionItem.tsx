'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { Icon } from '../Icon';
import { ChevronDownIcon } from '../Icon/internal/ChevronDown';
import * as styles from './Accordion.css';
import { useAccordion } from './AccordionContext';

interface AccordionItemOwnProps {
  /** Identifies the item in the `Accordion`'s value. */
  value: string;
  /** The header's content, inline. */
  title: ReactNode;
  /** Stops it opening or closing. @default false */
  disabled?: boolean;
  /** Overrides the `Accordion`'s `keepMounted` for this item. */
  keepMounted?: boolean;
  /** The content shown when it's open. */
  children?: ReactNode;
}

/** `AccordionItem`'s props. */
export type AccordionItemProps = ComponentProps<'div', AccordionItemOwnProps>;

/** A section of an `Accordion`: its heading, header button, and content. */
export function AccordionItem({
  value,
  title,
  disabled = false,
  keepMounted,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const accordion = useAccordion();
  const [layout, rest] = splitLayoutProps(props);
  const Heading = `h${accordion.headingLevel}` as const;
  const keep = keepMounted ?? accordion.keepMounted;
  return (
    <BaseAccordion.Item
      {...rest}
      value={value}
      disabled={disabled}
      className={cx(box(layout), styles.item, className)}
    >
      <BaseAccordion.Header render={<Heading />} className={styles.heading}>
        <BaseAccordion.Trigger
          className={cx(styles.trigger, styles.size[accordion.size], focusRing)}
        >
          <span className={styles.title}>{title}</span>
          <Icon icon={ChevronDownIcon} className={styles.chevron} />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel hiddenUntilFound={keep} className={styles.panel}>
        <div className={styles.content}>{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
