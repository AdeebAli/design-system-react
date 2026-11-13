'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Avatar.css';
import { avatarColorIndex } from './colorFromName';
import { initials } from './initials';

/** What `Avatar`'s status dot shows. */
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

const defaultStatusLabels: Record<AvatarStatus, string> = {
  online: 'online',
  away: 'away',
  busy: 'busy',
  offline: 'offline',
};

interface AvatarOwnProps {
  /** The accessible name, and the source of the initials. */
  name: string;
  /** The image. Until it loads, and if it fails, the initials show. */
  src?: string;
  /** `size.avatar.*`. @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** @default 'circle' */
  shape?: 'circle' | 'square';
  /** Replaces the initials, such as an `Icon`. It's hidden from screen readers. */
  fallback?: ReactNode;
  /** Hides it from screen readers, for when the name is already beside it. */
  decorative?: boolean;
  /**
   * Adds a status dot, and the status to the name. It's displayed, not
   * announced when it changes.
   */
  status?: AvatarStatus;
  /** Each status's words in the name, for translation. @default English */
  statusLabels?: Partial<Record<AvatarStatus, string>>;
  /** Colors the fallback with one of six pairs, picked from `name`. */
  colorFromName?: boolean;
}

/** `Avatar`'s props. */
export type AvatarProps = Omit<
  ComponentProps<'span', AvatarOwnProps>,
  'children' | 'role' | 'aria-label'
>;

/** Represents a person or organization, with an image or initials. */
export function Avatar({
  name,
  src,
  size = 'md',
  shape = 'circle',
  fallback,
  decorative = false,
  status,
  statusLabels,
  colorFromName = false,
  className,
  ...props
}: AvatarProps) {
  const [layout, rest] = splitLayoutProps(props);
  const label = status
    ? `${name}, ${statusLabels?.[status] ?? defaultStatusLabels[status]}`
    : name;
  return (
    <BaseAvatar.Root
      className={cx(styles.root, styles.size[size], box(layout), className)}
      {...rest}
      data-shape={shape}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': label })}
    >
      <span
        aria-hidden="true"
        className={cx(styles.face, status && styles.masked)}
      >
        {/* The fallback comes first so the image paints over it, even before
            hydration, when Base UI hasn't unmounted the fallback yet. */}
        <BaseAvatar.Fallback
          className={cx(
            styles.fallback,
            colorFromName && styles.color[avatarColorIndex(name)],
          )}
        >
          {fallback ?? initials(name)}
        </BaseAvatar.Fallback>
        {src !== undefined && (
          <BaseAvatar.Image
            keepMounted
            src={src}
            alt=""
            className={styles.image}
          />
        )}
      </span>
      {status && (
        <span
          aria-hidden="true"
          className={cx(styles.dotBase, styles.status[status])}
        />
      )}
    </BaseAvatar.Root>
  );
}
