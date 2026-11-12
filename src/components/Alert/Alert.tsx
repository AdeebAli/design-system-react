import type { ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { Box } from '../Box';
import { Icon, type IconProps } from '../Icon';
import { CircleAlertIcon } from '../Icon/internal/CircleAlert';
import { CircleCheckIcon } from '../Icon/internal/CircleCheck';
import { InfoIcon } from '../Icon/internal/Info';
import { TriangleAlertIcon } from '../Icon/internal/TriangleAlert';
import * as styles from './Alert.css';
import { AlertDismiss } from './AlertDismiss';

/** `Alert`'s color meanings. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const toneIcons: Record<AlertTone, IconProps['icon']> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

const roles = { off: undefined, polite: 'status', assertive: 'alert' } as const;

interface AlertOwnProps {
  /** The color meaning. Each tone also has its own icon. @default 'info' */
  tone?: AlertTone;
  /** Bold text before the body. It isn't a heading. */
  title?: ReactNode;
  /** An `Icon` element, or `null` for none. @default an icon per tone */
  icon?: ReactElement | null;
  /** Usually a `Button`. */
  action?: ReactNode;
  /**
   * Adds a dismiss button that calls this. Removing the `Alert` is the
   * project's job, and so is moving focus if the button had it.
   */
  onDismiss?: () => void;
  /** The dismiss button's name. @default 'Dismiss' */
  dismissLabel?: string;
  /**
   * `polite` gives `role="status"` and `assertive` gives `role="alert"`. A
   * screen reader reliably announces only a region already on the page, so
   * this suits an `Alert` that's mounted and changes its text. @default 'off'
   */
  live?: 'off' | 'polite' | 'assertive';
}

/** `Alert`'s props. */
export type AlertProps = ComponentProps<'div', AlertOwnProps>;

/** A message that stays in the page, such as a warning above a form. */
export function Alert({
  tone = 'info',
  title,
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  live = 'off',
  className,
  children,
  ...props
}: AlertProps) {
  const shown = icon === undefined ? <Icon icon={toneIcons[tone]} /> : icon;
  return (
    <Box
      className={cx(styles.root, styles.tone[tone], className)}
      role={roles[live]}
      {...props}
      data-tone={tone}
    >
      {shown && (
        <span className={cx(styles.iconSlot, styles.icon[tone])}>{shown}</span>
      )}
      <div className={styles.content}>
        {title !== undefined && title !== null && (
          <div className={styles.title}>{title}</div>
        )}
        {children !== undefined && children !== null && (
          <div className={styles.body}>{children}</div>
        )}
        {action !== undefined && action !== null && (
          <div className={styles.action}>{action}</div>
        )}
      </div>
      {onDismiss && (
        <AlertDismiss
          label={dismissLabel}
          onDismiss={onDismiss}
          className={styles.dismiss}
        />
      )}
    </Box>
  );
}
