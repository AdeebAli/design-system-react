'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { Text } from '../Text/Text';

/** `PopoverDescription`'s props. */
export type PopoverDescriptionProps = React.ComponentPropsWithRef<'p'>;

/** Describes the popover. Renders a `p`. */
export function PopoverDescription(props: PopoverDescriptionProps) {
  return <BasePopover.Description {...props} render={<Text tone="muted" />} />;
}
