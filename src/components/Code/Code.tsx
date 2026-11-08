import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Code.css';

/** `Code`'s props. */
export type CodeProps = ComponentProps<'code'>;

/** Inline code. */
export function Code({ className, ...props }: CodeProps) {
  return <Box as="code" className={cx(styles.code, className)} {...props} />;
}
