import type { ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Heading, type HeadingLevel } from '../Heading';
import { Stack } from '../Stack';
import { Text } from '../Text';
import * as styles from './EmptyState.css';

interface EmptyStateOwnProps {
  /** The heading text. Required. */
  title: ReactNode;
  /** Supporting text, in the muted color. */
  description?: ReactNode;
  /** An `Icon` element. Its size and tone are set where you pass it. */
  icon?: ReactElement;
  /** What to do next, such as a `Button`. */
  action?: ReactNode;
  /** The heading's level, which sets the tag only. @default 3 */
  headingLevel?: HeadingLevel;
  /** The padding and title size. @default 'md' */
  size?: 'sm' | 'md';
}

/** `EmptyState`'s props. */
export type EmptyStateProps = ComponentProps<'div', EmptyStateOwnProps>;

/** What to show when a list or table has nothing in it. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  headingLevel = 3,
  size = 'md',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Stack
      align="center"
      gap="3"
      className={cx(styles.emptyState({ size }), className)}
      {...props}
    >
      {icon}
      <Heading
        level={headingLevel}
        size={size === 'md' ? 'lg' : 'md'}
        weight="semibold"
      >
        {title}
      </Heading>
      {description != null && <Text tone="muted">{description}</Text>}
      {action}
    </Stack>
  );
}
