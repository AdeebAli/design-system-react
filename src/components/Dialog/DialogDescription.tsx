'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Text } from '../Text/Text';
import { useDialogContext, useRegisterPart } from './DialogContext';

/** `DialogDescription`'s props. */
export type DialogDescriptionProps = React.ComponentPropsWithRef<'p'>;

/** Describes the dialog. Renders a `p`. */
export function DialogDescription(props: DialogDescriptionProps) {
  const { register } = useDialogContext('DialogDescription');
  useRegisterPart(register, 'description');
  return <BaseDialog.Description {...props} render={<Text tone="muted" />} />;
}
