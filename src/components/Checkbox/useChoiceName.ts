import type { ReactNode } from 'react';
import { warnOnce } from '../../utils/warn';

/** Warns once when a choice control has no accessible name (Spec 09). */
export function warnIfUnnamed(
  component: string,
  props: {
    label?: ReactNode;
    'aria-label'?: string;
    'aria-labelledby'?: string;
  },
  hasFieldLabel: boolean,
): void {
  if (
    props.label != null ||
    props['aria-label'] ||
    props['aria-labelledby'] ||
    hasFieldLabel
  )
    return;
  warnOnce(
    `${component}-unnamed`,
    `${component}: it has no accessible name. Pass \`label\`, an \`aria-label\`, or put it in a Field with a \`label\`.`,
  );
}
