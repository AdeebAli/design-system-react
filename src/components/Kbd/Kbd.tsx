import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Kbd.css';

/** `Kbd`'s props. */
export type KbdProps = ComponentProps<'kbd'>;

/** A keyboard key. For a shortcut, use one per key. */
export function Kbd({ className, ...props }: KbdProps) {
  return <Box as="kbd" className={cx(styles.kbd, className)} {...props} />;
}
