import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Table.css';

/** `TableCaption`'s props. */
export interface TableCaptionProps extends ComponentPropsWithRef<'caption'> {
  /** Hides the caption but still names the table for screen readers. @default false */
  visuallyHidden?: boolean;
}

/** The table's visible or screen-reader caption. */
export function TableCaption({
  visuallyHidden = false,
  className,
  ...props
}: TableCaptionProps) {
  if (visuallyHidden) {
    return <VisuallyHidden as="caption" className={className} {...props} />;
  }
  return <caption className={cx(styles.caption, className)} {...props} />;
}
