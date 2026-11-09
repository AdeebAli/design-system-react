'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';

interface TabsPanelOwnProps {
  /** Matches a `Tab`'s `value`. */
  value: string;
  /**
   * Keeps the content rendered, hidden, while another tab is selected, to
   * preserve form state or scroll position. @default false
   */
  keepMounted?: boolean;
  children?: ReactNode;
}

/** `TabsPanel`'s props. */
export type TabsPanelProps = ComponentProps<'div', TabsPanelOwnProps>;

/** The content for one tab. It has no styling of its own beyond a focus ring. */
export function TabsPanel({
  value,
  keepMounted = false,
  className,
  children,
  ...props
}: TabsPanelProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseTabs.Panel
      value={value}
      keepMounted={keepMounted}
      render={<div {...rest} />}
      className={cx(box(layout), focusRing, className)}
    >
      {children}
    </BaseTabs.Panel>
  );
}
