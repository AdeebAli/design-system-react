'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { OverlayTriggerProps } from '../overlays/trigger';
import { useDialogContext } from './DialogContext';

/** `DialogTrigger`'s props. The one child must render a `button`. */
export type DialogTriggerProps = OverlayTriggerProps;

/** Opens the dialog. The child gets the behavior and keeps its own `onClick`. */
export function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const { alert } = useDialogContext('DialogTrigger');
  const Trigger = alert ? AlertDialog.Trigger : BaseDialog.Trigger;
  return <Trigger {...props} render={children} />;
}
