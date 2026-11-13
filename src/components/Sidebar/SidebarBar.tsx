'use client';

import type { ReactNode, RefObject } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import { MenuIcon } from '../Icon/internal/Menu';
import { IconButton } from '../IconButton';
import * as styles from './Sidebar.css';

interface SidebarBarProps {
  brand: ReactNode;
  menuLabel: string;
  open: boolean;
  onOpen: () => void;
  menuRef: RefObject<HTMLButtonElement | null>;
  sticky: boolean;
}

/** The bar across the top below `md`: `brand` and the menu button. Not a landmark. */
export function SidebarBar({
  brand,
  menuLabel,
  open,
  onOpen,
  menuRef,
  sticky,
}: SidebarBarProps) {
  return (
    <div className={cx(styles.bar, sticky && styles.barSticky)}>
      {brand != null && <div className={styles.brand}>{brand}</div>}
      <IconButton
        ref={menuRef}
        variant="ghost"
        size="md"
        aria-label={menuLabel}
        icon={<Icon icon={MenuIcon} />}
        data-open={open ? '' : undefined}
        onClick={onOpen}
      />
    </div>
  );
}
