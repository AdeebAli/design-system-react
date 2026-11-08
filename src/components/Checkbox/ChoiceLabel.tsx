'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { box } from '../Box';
import type { LayoutProps } from '../Box/types';
import * as styles from './choice.css';

interface ChoiceLabelProps {
  label?: ReactNode;
  hint?: ReactNode;
  layout: LayoutProps;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  /** Inside a `Field`, the wrapper is a Field.Item; outside, its own Field.Root. */
  inField: boolean;
  hintIndent: 'checkbox' | 'switch';
  /** Renders the control, given the classes it takes when it's the root. */
  children: (rootClass: string | undefined) => ReactElement;
}

/**
 * Lays out a Checkbox, Radio, or Switch with its own label and hint. With its
 * own label it's wrapped in Field.Item, so that label names it, not a
 * surrounding Field's (Spec 09). Outside a Field, its own Field.Root does
 * that. With neither label nor hint, the control is the root.
 */
export function ChoiceLabel({
  label,
  hint,
  layout,
  className,
  style,
  disabled,
  inField,
  hintIndent,
  children,
}: ChoiceLabelProps) {
  if (label == null && hint == null) {
    return children(cx(box(layout), className) || undefined);
  }

  const Wrapper = inField ? BaseField.Item : BaseField.Root;
  return (
    <Wrapper
      disabled={disabled}
      className={cx(box(layout), styles.item, className)}
      style={style}
    >
      <BaseField.Label className={styles.label}>
        <span className={styles.slot}>{children(undefined)}</span>
        {label}
      </BaseField.Label>
      {hint != null && (
        <BaseField.Description className={styles.hint[hintIndent]}>
          {hint}
        </BaseField.Description>
      )}
    </Wrapper>
  );
}
