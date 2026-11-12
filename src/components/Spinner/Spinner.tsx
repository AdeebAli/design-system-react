import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Spinner.css';

interface SpinnerOwnProps {
  /** `size.icon.*`. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Announced as `role="status"`. Without it, the spinner is hidden from
   * screen readers, for when nearby text or `aria-busy` already says what's
   * happening. A status that mounts with its text isn't always announced, so
   * keep a status region mounted when the announcement matters.
   */
  label?: string;
}

/** `Spinner`'s props. */
export type SpinnerProps = Omit<
  PolymorphicProps<'span', SpinnerOwnProps>,
  'as' | 'children'
>;

/** Shows that something is working, when its duration is unknown. */
export function Spinner({
  size = 'md',
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <Box
      as="span"
      className={cx(styles.root, className)}
      {...props}
      {...(label ? { role: 'status' } : { 'aria-hidden': true })}
    >
      <svg
        className={cx(styles.svg, styles.size[size])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="9" opacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" />
      </svg>
      {label && <VisuallyHidden>{label}</VisuallyHidden>}
    </Box>
  );
}
