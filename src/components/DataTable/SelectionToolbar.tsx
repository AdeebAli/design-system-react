'use client';

import { Button } from '../Button';
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
      {/* A live region: assistive technology announces changes to it, not the text it mounts with. */}
      <span role="status" className={styles.count}>
        {message}
      </span>
      <Button size="sm" variant="ghost" onClick={onClear}>
        {labels.clearSelection}
      </Button>
    </div>
  );
}
