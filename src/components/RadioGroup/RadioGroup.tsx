'use client';

import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import type { Responsive, SpaceToken } from '../Box/types';
import { useFieldControl } from '../Field/FieldContext';
import { OverlayDirection } from '../overlays/direction';

const RadioGroupContext = createContext<{
  invalid: boolean;
  disabled: boolean;
  inField: boolean;
} | null>(null);

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/** Reads the surrounding `RadioGroup`, for `Radio`. */
export function useRadioGroup() {
  return useContext(RadioGroupContext);
}

interface RadioGroupOwnProps {
  /** The selected value, when controlled. `null` selects nothing. */
  value?: string | null;
  /** The value selected at first, when uncontrolled. `null` selects nothing. */
  defaultValue?: string | null;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** The name submitted with a form. */
  name?: string;
  /** Marks the group invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables every radio. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The space between radios. @default '2' */
  gap?: Responsive<SpaceToken>;
  /** The `Radio`s. */
  children?: ReactNode;
}

/** `RadioGroup`'s props. Label it with a surrounding `Field`. */
export type RadioGroupProps = ComponentProps<'div', RadioGroupOwnProps>;

/** A group of `Radio`s, one of which can be selected. */
export function RadioGroup({
  onValueChange,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  gap = '2',
  className,
  children,
  ref,
  ...props
}: RadioGroupProps) {
  const root = useRef<HTMLDivElement | null>(null);
  // Focuses the checked radio, or the first enabled one, as Tab would.
  const focus = useCallback(() => {
    const radios = root.current?.querySelectorAll<HTMLElement>(
      '[role="radio"]:not([data-disabled])',
    );
    const list = [...(radios ?? [])];
    (
      list.find((r) => r.getAttribute('aria-checked') === 'true') ?? list[0]
    )?.focus();
  }, []);
  const field = useFieldControl('button', focus);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node;
      // The ref stays the group element (Spec 05), but the group itself can't
      // take focus, so focusing it focuses a radio. React Hook Form calls this
      // after a failed submit.
      if (node) node.focus = focus;
      assignRef(ref, node);
    },
    [ref, focus],
  );
  const invalid = invalidProp ?? field.invalid;
  const disabled = disabledProp ?? field.disabled;
  const required = requiredProp ?? field.required;
  const [layout, rest] = splitLayoutProps(props);

  return (
    <RadioGroupContext.Provider
      value={{ invalid, disabled, inField: field.inField }}
    >
      {/* Base UI maps arrow keys from a React context, not the DOM `dir`. */}
      <OverlayDirection>
        <BaseRadioGroup
          ref={setRef}
          className={cx(
            box({ ...layout, display: 'flex', flexDirection: 'column', gap }),
            className,
          )}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          onValueChange={
            onValueChange &&
            ((value: unknown) => onValueChange(value as string))
          }
          {...rest}
        >
          {children}
        </BaseRadioGroup>
      </OverlayDirection>
    </RadioGroupContext.Provider>
  );
}
