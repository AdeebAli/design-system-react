'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { box } from '../Box';
import * as styles from './Tabs.css';
import { useTabsStyle } from './TabsContext';

/** `TabsList`'s props. Name it with `aria-label` or `aria-labelledby`. */
export type TabsListProps = ComponentProps<
  'div',
  {
    /** The `Tab`s. */
    children?: ReactNode;
  }
>;

/** The row of tabs. It scrolls sideways when the tabs don't fit. */
export function TabsList({ className, children, ...props }: TabsListProps) {
  const { variant } = useTabsStyle();
  const [layout, rest] = splitLayoutProps(props);
  if (rest['aria-label'] == null && rest['aria-labelledby'] == null) {
    warnOnce(
      'TabsList-unnamed',
      'TabsList: add `aria-label` or `aria-labelledby`, so screen readers can tell what the tabs switch between.',
    );
  }
  return (
    <BaseTabs.List
      // Arrow keys move focus only; Enter or Space activates.
      activateOnFocus={false}
      render={<div {...rest} />}
      className={cx(
        box(layout),
        styles.list,
        styles.listVariant[variant],
        className,
      )}
    >
      {children}
      <BaseTabs.Indicator
        className={cx(styles.indicator, styles.indicatorVariant[variant])}
      />
    </BaseTabs.List>
  );
}
