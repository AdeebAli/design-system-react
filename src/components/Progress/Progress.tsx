'use client';

import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Progress.css';

/** `Progress`'s color meanings. */
export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';

type ProgressName =
  | {
      /** Visible text that names the bar. */
      label: ReactNode;
      'aria-label'?: never;
    }
  | {
      /** Names the bar when there's no visible `label`. */
      'aria-label': string;
      label?: never;
    };

interface ProgressOwnProps {
  /** How far along, or `null` when that's unknown. */
  value: number | null;
  /** The value that means done. @default 100 */
  max?: number;
  /** Shows the percentage beside the label. @default false */
  showValue?: boolean;
  /** `sm` is 4px tall, `md` 8px. @default 'md' */
  size?: 'sm' | 'md';
  /** The fill's color meaning. @default 'accent' */
  tone?: ProgressTone;
}

/** `Progress`'s props. */
export type ProgressProps = Omit<
  ComponentProps<'div', ProgressOwnProps>,
  'children' | 'role' | 'label' | 'aria-label'
> &
  ProgressName;

/** Shows how far along something is. For scores, such as storage used, it isn't the right fit. */
export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  tone = 'accent',
  className,
  ...props
}: ProgressProps) {
  const [layout, rest] = splitLayoutProps(props);
  const hasHeader = (label !== undefined && label !== null) || showValue;
  return (
    <BaseProgress.Root
      value={value}
      max={max}
      className={cx(styles.root, box(layout), className)}
      {...rest}
    >
      {hasHeader && (
        <div className={styles.header}>
          {label !== undefined && label !== null && (
            <BaseProgress.Label className={styles.label}>
              {label}
            </BaseProgress.Label>
          )}
          {showValue && <BaseProgress.Value className={styles.value} />}
        </div>
      )}
      <BaseProgress.Track className={cx(styles.track, styles.size[size])}>
        <BaseProgress.Indicator
          className={cx(styles.fill, styles.tone[tone])}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
