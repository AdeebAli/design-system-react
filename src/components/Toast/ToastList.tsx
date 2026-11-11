'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { cx } from '../../utils/cx';
import { popupSurface } from '../overlays/popup.css';
import { Button } from '../Button';
import { Icon, type IconProps } from '../Icon';
import { CircleAlertIcon } from '../Icon/internal/CircleAlert';
import { CircleCheckIcon } from '../Icon/internal/CircleCheck';
import { InfoIcon } from '../Icon/internal/Info';
import { TriangleAlertIcon } from '../Icon/internal/TriangleAlert';
import { XIcon } from '../Icon/internal/X';
import { IconButton } from '../IconButton';
import * as styles from './Toast.css';
import type { ToastData, ToastPosition, ToastTone } from './toastOptions';

const toneIcons: Record<
  Exclude<ToastTone, 'neutral'>,
  { icon: IconProps['icon']; tone: NonNullable<IconProps['tone']> }
> = {
  success: { icon: CircleCheckIcon, tone: 'success' },
  warning: { icon: TriangleAlertIcon, tone: 'warning' },
  danger: { icon: CircleAlertIcon, tone: 'danger' },
  info: { icon: InfoIcon, tone: 'info' },
};

/** Swipe toward the nearest edge, so it leaves the way it came. */
function swipeDirections(position: ToastPosition) {
  const vertical = position.startsWith('top') ? 'up' : 'down';
  if (position.endsWith('-end')) return ['right', vertical] as const;
  if (position.endsWith('-start')) return ['left', vertical] as const;
  return [vertical] as const;
}

/** `closeLabel` names every dismiss button. */
export function ToastList({
  position,
  closeLabel,
}: {
  position: ToastPosition;
  closeLabel: string;
}) {
  const { toasts, close } = BaseToast.useToastManager<ToastData>();
  return toasts.map((toast) => {
    const tone = toast.data?.tone ?? 'neutral';
    const shown = tone === 'neutral' ? undefined : toneIcons[tone];
    return (
      <BaseToast.Root
        key={toast.id}
        toast={toast}
        className={cx(popupSurface, styles.root)}
        data-tone={tone}
        swipeDirection={[...swipeDirections(position)]}
      >
        <BaseToast.Content className={styles.content}>
          {shown && (
            <Icon icon={shown.icon} tone={shown.tone} className={styles.icon} />
          )}
          <div className={styles.text}>
            {toast.title !== undefined && (
              <BaseToast.Title className={styles.title} />
            )}
            {toast.description !== undefined && (
              <BaseToast.Description className={styles.description} />
            )}
          </div>
          <div className={styles.actions}>
            {toast.actionProps && (
              <BaseToast.Action
                // Base UI runs the action's own `onClick` (from `actionProps`) first, then this.
                onClick={() => close(toast.id)}
                render={<Button size="sm" variant="soft" />}
              />
            )}
            <BaseToast.Close
              aria-hidden={false}
              render={
                <IconButton
                  size="sm"
                  variant="ghost"
                  tone="neutral"
                  aria-label={closeLabel}
                  icon={<Icon icon={XIcon} />}
                />
              }
            />
          </div>
        </BaseToast.Content>
      </BaseToast.Root>
    );
  });
}
