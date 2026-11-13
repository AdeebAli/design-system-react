'use client';

import { useId, type ReactNode } from 'react';
import * as styles from './Sidebar.css';

/** `SidebarGroup`'s props. */
export interface SidebarGroupProps {
  /** Names the group's list. Without it, the list is unnamed. */
  label?: string;
  /** `SidebarLink`s. */
  children?: ReactNode;
}

/** A list of `SidebarLink`s, named by its `label`. */
export function SidebarGroup({ label, children }: SidebarGroupProps) {
  const id = useId();
  return (
    <div className={styles.group}>
      {label != null && (
        <span id={id} className={styles.groupLabel}>
          {label}
        </span>
      )}
      <ul
        className={styles.list}
        aria-labelledby={label != null ? id : undefined}
      >
        {children}
      </ul>
    </div>
  );
}
