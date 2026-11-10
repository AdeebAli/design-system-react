'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { Heading } from '../Heading/Heading';
import * as styles from './Dialog.css';
import { useDialogContext, useRegisterPart } from './DialogContext';

/** `DialogTitle`'s props. */
export type DialogTitleProps = Omit<
  React.ComponentPropsWithRef<'h2'>,
  'children'
> & { children?: React.ReactNode };

/** The dialog's name. Always an `h2`, since a dialog starts its own heading structure. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const { register } = useDialogContext('DialogTitle');
  useRegisterPart(register, 'title');
  return (
    <BaseDialog.Title
      {...props}
      className={cx(styles.title, className)}
      render={<Heading level={2} size="xl" />}
    />
  );
}
