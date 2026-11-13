'use client';

import { Icon } from '../Icon';
import { XIcon } from '../Icon/internal/X';
import { IconButton } from '../IconButton';

/** `Alert`'s dismiss button. It's a client file so `Alert` can stay server-safe. */
export function AlertDismiss({
  label,
  onDismiss,
  className,
}: {
  label: string;
  onDismiss: () => void;
  className?: string;
}) {
  return (
    <IconButton
      size="sm"
      variant="ghost"
      tone="neutral"
      aria-label={label}
      icon={<Icon icon={XIcon} />}
      onClick={() => onDismiss()}
      className={className}
    />
  );
}
