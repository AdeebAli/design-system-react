import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import { Icon } from '../Icon';
import { ArrowDownIcon } from '../Icon/internal/ArrowDown';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { MinusIcon } from '../Icon/internal/Minus';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Stat.css';

/** The direction of a change. */
export type StatTrend = 'up' | 'down' | 'flat';

/** Whether a change is good, bad, or neither. */
export type StatSentiment = 'positive' | 'negative' | 'neutral';

/** Value sizes: 22px, 28px, and 36px. */
export type StatSize = 'sm' | 'md' | 'lg';

/** Hidden text announcing each trend, for translation. */
export interface StatTrendLabels {
  up: string;
  down: string;
  flat: string;
}

const DEFAULT_TREND_LABELS: StatTrendLabels = {
  up: 'Up',
  down: 'Down',
  flat: 'No change',
};

const TREND_ICONS = { up: ArrowUpIcon, down: ArrowDownIcon, flat: MinusIcon };

const TREND_SENTIMENT: Record<StatTrend, StatSentiment> = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral',
};

interface StatOwnProps {
  /** What the number measures. Pass normal case; it's uppercased by CSS. */
  label: ReactNode;
  /** The number. */
  value: ReactNode;
  /** The change, without a sign when `trend` is set, so it reads "Down 4.1". */
  change?: ReactNode;
  /** The direction of the change, shown with an arrow and hidden text. */
  trend?: StatTrend;
  /**
   * Colors the change. An increase isn't always good.
   * @default From `trend`: up is positive, down is negative, flat is neutral
   */
  sentiment?: StatSentiment;
  /** A line below the value. */
  hint?: ReactNode;
  /** The value's size. @default 'md' */
  size?: StatSize;
  /** Hidden text for each trend. @default { up: 'Up', down: 'Down', flat: 'No change' } */
  trendLabels?: StatTrendLabels;
}

/** `Stat`'s props. */
export type StatProps = ComponentProps<'dl', StatOwnProps>;

/** A labeled number, with an optional change. Put it in a `Card`, or anywhere. */
export function Stat({
  label,
  value,
  change,
  trend,
  sentiment,
  hint,
  size = 'md',
  trendLabels = DEFAULT_TREND_LABELS,
  className,
  ...props
}: StatProps) {
  const tone = sentiment ?? (trend ? TREND_SENTIMENT[trend] : 'neutral');
  const hasChange = change != null || trend != null;

  return (
    <Box as="dl" className={cx(styles.root, className)} {...props}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value[size]}>{value}</dd>
      {hasChange && (
        <dd className={cx(styles.change, styles.sentiment[tone])}>
          {trend && (
            <>
              <Icon icon={TREND_ICONS[trend]} size="inherit" />
              <VisuallyHidden>
                {trendLabels[trend]}
                {change != null && ' '}
              </VisuallyHidden>
            </>
          )}
          {change}
        </dd>
      )}
      {hint != null && <dd className={styles.hint}>{hint}</dd>}
    </Box>
  );
}
