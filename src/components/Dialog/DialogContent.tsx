'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useEffect, type ComponentPropsWithRef, type RefObject } from 'react';
import { cx } from '../../utils/cx';
import { warnOnce } from '../../utils/warn';
import { Icon } from '../Icon';
import { XIcon } from '../Icon/internal/X';
import { IconButton } from '../IconButton';
import { popupMotion } from '../overlays/popup.css';
import { useDialogContext, useRegisterPart } from './DialogContext';
import * as styles from './Dialog.css';

/** Dialog widths: 24, 32, and 44rem, capped to the viewport. */
export type DialogSize = 'sm' | 'md' | 'lg';

/** `DialogContent`'s props. */
export type DialogContentProps = ComponentPropsWithRef<'div'> & {
  /** The width. @default 'md' */
  size?: DialogSize;
  /** Shows the close button. Always `false` with `alert`. @default true */
  showClose?: boolean;
  /** The close button's name. @default 'Close' */
  closeLabel?: string;
  /** What gets focus on open. Unset, the first focusable element (the popup on touch). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** What gets focus on close. Unset, the trigger. */
  finalFocus?: RefObject<HTMLElement | null>;
};

/** The dialog's backdrop and popup, rendered in a portal. */
export function DialogContent({
  size = 'md',
  showClose = true,
  closeLabel = 'Close',
  initialFocus,
  finalFocus,
  className,
  children,
  ...props
}: DialogContentProps) {
  const { alert } = useDialogContext('DialogContent');
  const closeButton = showClose && !alert;
  const labelled = Boolean(props['aria-label'] ?? props['aria-labelledby']);

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        {...props}
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        className={cx(styles.popup, styles.sizes[size], popupMotion, className)}
      >
        {children}
        {closeButton && <CloseButton label={closeLabel} />}
        <Checks closeButton={closeButton} labelled={labelled} />
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function CloseButton({ label }: { label: string }) {
  const { register } = useDialogContext('DialogContent');
  useRegisterPart(register, 'close');
  return (
    <BaseDialog.Close
      render={
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={label}
          icon={<Icon icon={XIcon} />}
          className={styles.close}
        />
      }
    />
  );
}

/**
 * Warns about missing parts. It renders inside the popup, so it only runs while
 * the dialog is open, and after its siblings have registered themselves.
 */
function Checks({
  closeButton,
  labelled,
}: {
  closeButton: boolean;
  labelled: boolean;
}) {
  const { alert, has } = useDialogContext('DialogContent');
  useEffect(() => {
    if (!has('title') && !labelled) {
      warnOnce(
        'dialog-name',
        'DialogContent: the dialog has no name. Add a `DialogTitle`, or give `DialogContent` an `aria-label`.',
      );
    }
    if (alert && !has('description')) {
      warnOnce(
        'dialog-alert-description',
        'Dialog: an `alert` dialog should have a `DialogDescription`, which says what is being confirmed.',
      );
    }
    if (!closeButton && !has('close')) {
      warnOnce(
        'dialog-no-close',
        'DialogContent: there is no close button, so add a `DialogClose` to the content. Touch screen reader users need a way out.',
      );
    }
  }, [alert, closeButton, labelled, has]);
  return null;
}
