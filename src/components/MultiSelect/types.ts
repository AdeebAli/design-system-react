import type { ComponentProps } from '../../utils/types';
import type { SearchLabels, SearchProps } from '../Combobox/useOptionSearch';
import type { Option, OptionGroup } from '../Select/options';
import type { SelectSize } from '../Select/Select';

/** Strings for translation. */
export interface MultiSelectLabels extends SearchLabels {
  /** A chip's remove button name, where `{label}` is the option. @default 'Remove {label}' */
  remove?: string;
  /** How to remove chips, read as the chips' and input's description. @default 'Press Backspace to remove the last item' */
  removeHint?: string;
  /** The count after the first label, where `{count}` is the number of others. @default '+{count}' */
  more?: string;
}

export const defaultMultiSelectLabels: Required<MultiSelectLabels> = {
  remove: 'Remove {label}',
  removeHint: 'Press Backspace to remove the last item',
  more: '+{count}',
  loading: 'Loading',
  empty: 'No results',
  results: '{count} results',
};

interface MultiSelectSharedProps {
  /** The options, as values and labels, optionally in groups. */
  options: readonly (Option | OptionGroup)[];
  /** The selected values, when controlled. `[]` means nothing is selected. */
  value?: string[];
  /** The values selected at first, when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new list of selected values. */
  onValueChange?: (value: string[]) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** The height of the control. @default 'md' */
  size?: SelectSize;
  /** Marks it invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables it. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The name each value is submitted under in a form, one entry per value. */
  name?: string;
  /** Strings for translation. */
  labels?: MultiSelectLabels;
}

interface ButtonOwnProps extends MultiSelectSharedProps {
  /** Adds a search input and shows the selection as chips. @default false */
  searchable?: false;
  onSearch?: never;
  loading?: never;
  selectedOptions?: never;
}

interface SearchableOwnProps extends MultiSelectSharedProps, SearchProps {
  /** Adds a search input and shows the selection as chips. */
  searchable: true;
}

/**
 * The default `MultiSelect`'s props. `ref`, `className`, `style`, and layout
 * props go to the trigger button.
 */
export type MultiSelectButtonProps = ComponentProps<'button', ButtonOwnProps>;

/**
 * `MultiSelect searchable`'s props. `ref` and native attributes go to the
 * `input`; `className`, `style`, and layout props go to the chip wrapper.
 */
export type MultiSelectSearchProps = ComponentProps<
  'input',
  SearchableOwnProps
>;

/** `MultiSelect`'s props: `searchable` decides the control, and `ref`'s target. */
export type MultiSelectProps = MultiSelectButtonProps | MultiSelectSearchProps;
