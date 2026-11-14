'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactElement, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Tabs.css';
import { useTabsStyle } from './TabsContext';

interface TabOwnProps {
  /** Matches a `TabsPanel`'s `value`. */
  value: string;
  /** Can't be selected. @default false */
  disabled?: boolean;
  /** An `Icon` element before the text. */
  startIcon?: ReactElement;
  /** The tab's label. */
  children?: ReactNode;
}

/** `Tab`'s props. */
export type TabProps = ComponentProps<'button', TabOwnProps>;

/** One tab in a `TabsList`. */
export function Tab({
  value,
  disabled,
  startIcon,
  className,
  children,
  ...props
}: TabProps) {
  const { variant, size } = useTabsStyle();
  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseTabs.Tab
      value={value}
      disabled={disabled}
      render={<button type="button" {...rest} />}
      className={cx(
        box(layout),
        styles.tab,
        styles.tabVariant[variant],
        styles.tabSize[size],
        focusRing,
        className,
      )}
    >
      {startIcon && <span className={styles.tabIcon}>{startIcon}</span>}
      {children}
    </BaseTabs.Tab>
  );
}
