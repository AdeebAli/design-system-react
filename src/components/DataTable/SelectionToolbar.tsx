'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './DataTable.css';

interface SelectionToolbarProps {
  /** How many rows are selected, on every page. */
  count: number;
  /** Whether the enabled rows on this page are all, some, or none selected. */
  pageState: 'true' | 'false' | 'mixed';
  onSelectPage: () => void;
  onClear: () => void;
  labels: {
    selection: string;
    selectPage: string;
    clearSelection: string;
    selectedCount: string;
  };
}

/** The toolbar above a `multiple` table: Select page, the count, and Clear. */
export function SelectionToolbar({
  count,
  pageState,
  onSelectPage,
  onClear,
  labels,
}: SelectionToolbarProps) {
  const message = labels.selectedCount.replace('{count}', String(count));
  // The live region starts empty and fills after the first change, so a screen
  // reader announces changes and not the count it finds on first render.
  const [changed, setChanged] = useState(false);
  const previous = useRef(count);
  useEffect(() => {
    if (previous.current !== count) {
      previous.current = count;
      setChanged(true);
    }
  }, [count]);

  return (
    <div role="group" aria-label={labels.selection} className={styles.toolbar}>
      <Button
        size="sm"
        variant={
          pageState === 'true'
            ? 'solid'
            : pageState === 'mixed'
              ? 'soft'
              : 'outline'
        }
        aria-pressed={pageState}
        onClick={onSelectPage}
      >
        {labels.selectPage}
      </Button>
      <span aria-hidden="true" className={styles.count}>
        {message}
      </span>
      <VisuallyHidden role="status">{changed ? message : null}</VisuallyHidden>
      <Button size="sm" variant="ghost" onClick={onClear}>
        {labels.clearSelection}
      </Button>
    </div>
  );
}
