/** One choice in a `Select`. */
export interface Option {
  /** The value. `null` isn't allowed, since it means nothing is selected. */
  value: string;
  /** Shown in the list and the closed `Select`, and used for type-ahead. */
  label: string;
  /** Whether it can't be chosen. @default false */
  disabled?: boolean;
}

/** A labeled group of options. */
export interface OptionGroup {
  /** The group's heading. */
  label: string;
  options: Option[];
}

interface NormalizedGroup {
  label?: string;
  options: Option[];
}

function isGroup(option: Option | OptionGroup): option is OptionGroup {
  return 'options' in option;
}

/**
 * Turns a mix of options and groups into groups only, wrapping each run of
 * loose options in an unlabeled group, in order, and collects each value's
 * label for the closed `Select`.
 */
export function normalizeOptions(options: readonly (Option | OptionGroup)[]): {
  groups: NormalizedGroup[];
  items: Record<string, string>;
} {
  const groups: NormalizedGroup[] = [];
  const items: Record<string, string> = {};
  let loose: Option[] | null = null;
  for (const option of options) {
    if (isGroup(option)) {
      loose = null;
      groups.push({ label: option.label, options: option.options });
      for (const item of option.options) items[item.value] = item.label;
    } else {
      if (loose == null) {
        loose = [];
        groups.push({ options: loose });
      }
      loose.push(option);
      items[option.value] = option.label;
    }
  }
  return { groups, items };
}
