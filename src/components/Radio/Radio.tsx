'use client';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import type { ReactNode, Ref } from 'react';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import * as styles from '../Checkbox/choice.css';
import { ChoiceLabel } from '../Checkbox/ChoiceLabel';
import { warnIfUnnamed } from '../Checkbox/useChoiceName';
import { useRadioGroup } from '../RadioGroup/RadioGroup';

interface RadioOwnProps {
  /** The value this radio selects. */
  value: string;
  /** The radio's label. The whole label is clickable. */
  label?: ReactNode;
  /** Help text below the label. */
  hint?: ReactNode;
  /** Disables this radio. @default false */
  disabled?: boolean;
  /** A ref to the hidden `input`. */
  inputRef?: Ref<HTMLInputElement>;
}

/** `Radio`'s props. Only valid inside a `RadioGroup`. */
export type RadioProps = ComponentProps<'span', RadioOwnProps>;

/** One choice in a `RadioGroup`. */
export function Radio({
  label,
  hint,
  disabled,
  className,
  style,
  ...props
}: RadioProps) {
  const group = useRadioGroup();
  if (group == null) {
    warnOnce('radio-outside-group', 'Radio: it must be inside a RadioGroup.');
  }
  warnIfUnnamed('Radio', { label, ...props }, false);
  const invalid = group?.invalid ?? false;
  const [layout, rest] = splitLayoutProps(props);

  return (
    <ChoiceLabel
      label={label}
      hint={hint}
      layout={layout}
      className={className}
      style={style}
      disabled={disabled}
      inField={group?.inField ?? false}
      hintIndent="checkbox"
    >
      {(rootClass) => (
        <BaseRadio.Root
          className={[styles.radio, rootClass].filter(Boolean).join(' ')}
          style={rootClass === undefined ? undefined : style}
          disabled={disabled}
          data-invalid={invalid ? '' : undefined}
          {...rest}
        >
          <BaseRadio.Indicator className={styles.dot} />
        </BaseRadio.Root>
      )}
    </ChoiceLabel>
  );
}
