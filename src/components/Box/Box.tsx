import type { ComponentPropsWithRef } from 'react';
import * as styles from './Box.css';

export type BoxProps = ComponentPropsWithRef<'div'>;

export function Box({ className, ...props }: BoxProps) {
  return (
    <div
      className={className ? `${styles.box} ${className}` : styles.box}
      {...props}
    />
  );
}
