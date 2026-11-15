'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { Heading } from '../Heading/Heading';
import { usePopoverContext, useRegisterTitle } from './PopoverContext';

/** `PopoverTitle`'s props. */
export type PopoverTitleProps = Omit<
  React.ComponentPropsWithRef<'h2'>,
  'children'
> & {
  /** The popover's title, which also names it. */
  children?: React.ReactNode;
};

/** The popover's name. Renders an `h2`. */
export function PopoverTitle(props: PopoverTitleProps) {
  const { registerTitle } = usePopoverContext('PopoverTitle');
  useRegisterTitle(registerTitle);
  return (
    <BasePopover.Title {...props} render={<Heading level={2} size="lg" />} />
  );
}
