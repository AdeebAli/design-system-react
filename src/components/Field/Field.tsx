'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as styles from './Field.css';
import { FieldContext, type FieldControlKind } from './FieldContext';

interface FieldOwnProps {
  /** The control's label. Omit it when the control has its own, such as `Checkbox`. */
  label?: ReactNode;
  /** Help text below the control. It stays visible when there's an error. */
  hint?: ReactNode;
  /** An error message. Setting it marks the field invalid. */
  error?: ReactNode;
  /** Marks the field invalid without a message. @default false */
  invalid?: boolean;
  /** Sets `aria-required` on the control and shows an indicator. It doesn't validate. @default false */
  required?: boolean;
  /** Disables the control. @default false */
  disabled?: boolean;
  /** One control. */
  children?: ReactNode;
}

/** `Field`'s props. */
export type FieldProps = ComponentProps<'div', FieldOwnProps>;

/**
 * Connects a label, hint, and error to one control. It displays them; it
 * doesn't manage form state or validate.
 */
export function Field({
  label,
  hint,
  error,
  invalid: invalidProp = false,
  required = false,
  disabled = false,
  className,
  children,
  ...props
}: FieldProps) {
  const [kind, setKind] = useState<FieldControlKind>('native');
  const focusRef = useRef<(() => void) | null>(null);
  const invalid = invalidProp || error != null;
  const hasLabel = label != null;
  const context = useMemo(
    () => ({ invalid, disabled, required, hasLabel, setKind, focusRef }),
    [invalid, disabled, required, hasLabel],
  );
  const [layout, rest] = splitLayoutProps(props);

  const labelContent = (
    <>
      {label}
      {required && (
        <span className={styles.indicator} aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  return (
    <FieldContext.Provider value={context}>
      <BaseField.Root
        invalid={invalid}
        disabled={disabled}
        className={cx(box(layout), styles.root, className)}
        {...rest}
      >
        {hasLabel &&
          (kind === 'native' ? (
            <BaseField.Label className={styles.label}>
              {labelContent}
            </BaseField.Label>
          ) : (
            // A button control or a group isn't labelable by <label>, so a
            // click focuses it without activating it.
            <BaseField.Label
              nativeLabel={false}
              render={<div />}
              className={styles.label}
              onClick={() => focusRef.current?.()}
            >
              {labelContent}
            </BaseField.Label>
          ))}
        {children}
        {hint != null && (
          <BaseField.Description className={styles.hint}>
            {hint}
          </BaseField.Description>
        )}
        {error != null && (
          <BaseField.Error match className={styles.error}>
            {error}
          </BaseField.Error>
        )}
      </BaseField.Root>
    </FieldContext.Provider>
  );
}
