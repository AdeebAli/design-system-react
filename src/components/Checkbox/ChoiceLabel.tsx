'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { layoutStyle } from '../../utils/layoutStyle';
import type { LayoutProps } from '../Box/types';
import * as styles from './choice.css';

interface ChoiceLabelProps {
  /** The component using this, for warnings. */
  component: string;
  label?: ReactNode;
  hint?: ReactNode;
  layout: LayoutProps;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  /** Inside a `Field`, the wrapper is a Field.Item; outside, its own Field.Root. */
  inField: boolean;
  hintIndent: 'checkbox' | 'switch';
  /**
   * Renders the control, given the class and style it takes when it's the
   * root. Both are undefined when a wrapper holds the layout.
   */
  children: (
    rootClass: string | undefined,
    rootStyle: CSSProperties | undefined,
  ) => ReactElement;
}

/**
 * Lays out a Checkbox, Radio, or Switch with its own label and hint. With its
 * own label it's wrapped in Field.Item, so that label names it, not a
 * surrounding Field's (Spec 09). Outside a Field, its own Field.Root does
 * that. With neither label nor hint, the control is the root.
 */
export function ChoiceLabel({
  component,
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
  const grid = layoutStyle(layout, style, component);
  if (label == null && hint == null) {
    return children(cx(grid.className, className) || undefined, grid.style);
  }

  const wrapperClass = cx(grid.className, styles.item, className);
  const content = (
    <>
      {label != null ? (
        <BaseField.Label className={styles.label}>
          <span className={styles.slot}>{children(undefined, undefined)}</span>
          {label}
        </BaseField.Label>
      ) : (
        // No label of its own, so a surrounding Field's label names it.
        <span className={cx(styles.label, styles.unlabeled)}>
          <span className={styles.slot}>{children(undefined, undefined)}</span>
        </span>
      )}
      {hint != null && (
        <BaseField.Description className={styles.hint[hintIndent]}>
          {hint}
        </BaseField.Description>
      )}
    </>
  );

  // Without its own label inside a Field, the Field's label must name the
  // control, so no Field.Item may start a new label scope.
  if (label == null && inField) {
    return (
      <div className={wrapperClass} style={grid.style}>
        {content}
      </div>
    );
  }
  const Wrapper = inField ? BaseField.Item : BaseField.Root;
  return (
    <Wrapper disabled={disabled} className={wrapperClass} style={grid.style}>
      {content}
    </Wrapper>
  );
}
