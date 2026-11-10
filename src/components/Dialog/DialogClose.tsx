'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { OverlayTriggerProps } from '../overlays/trigger';
import { useDialogContext, useRegisterPart } from './DialogContext';

/** `DialogClose`'s props. The one child must render a `button`. */
export type DialogCloseProps = OverlayTriggerProps;

/** Closes the dialog. The child gets the behavior and keeps its own `onClick`. */
export function DialogClose({ children, ...props }: DialogCloseProps) {
  const { register } = useDialogContext('DialogClose');
  useRegisterPart(register, 'close');
  return <BaseDialog.Close {...props} render={children} />;
}
