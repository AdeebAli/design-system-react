'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import { OverlayDirection } from '../overlays/direction';
import { TabsContext, type TabsSize, type TabsVariant } from './TabsContext';

interface TabsSharedProps {
  /** Called with the newly selected tab's value. */
  onValueChange?: (value: string) => void;
  /** The style. @default 'underline' */
  variant?: TabsVariant;
  /** The size. @default 'md' */
  size?: TabsSize;
  children?: ReactNode;
}

/**
 * One of `value` or `defaultValue` is required, so the first tab isn't chosen
 * by index, which is wrong during server rendering if it's disabled.
 */
type TabsValueProps =
  | {
      /** The selected tab, when controlled. */
      value: string;
      defaultValue?: never;
    }
  | {
      /** The tab selected at first, when uncontrolled. */
      defaultValue: string;
      value?: never;
    };

/** `Tabs`'s props. */
export type TabsProps = ComponentProps<'div', TabsSharedProps & TabsValueProps>;

/** Switches between panels in the same page. For links between pages, use `NavBar`. */
export function Tabs({
  variant = 'underline',
  size = 'md',
  onValueChange,
  value,
  defaultValue,
  className,
  children,
  ...props
}: TabsProps) {
  const [layout, rest] = splitLayoutProps(props);
  return (
    <TabsContext.Provider value={{ variant, size }}>
      {/* Base UI maps arrow keys from a React context, not the DOM `dir`. */}
      <OverlayDirection>
        <BaseTabs.Root
          // The root's own props go on the rendered element, so they keep its types.
          render={<div {...rest} />}
          value={value}
          defaultValue={defaultValue}
          onValueChange={
            onValueChange &&
            // Base UI reports null when no tab is enabled; consumers get strings only.
            ((value: unknown) => {
              if (typeof value === 'string') onValueChange(value);
            })
          }
          className={cx(box(layout), className)}
        >
          {children}
        </BaseTabs.Root>
      </OverlayDirection>
    </TabsContext.Provider>
  );
}
