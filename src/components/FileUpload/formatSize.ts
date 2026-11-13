const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

/**
 * A file size for people, such as "1.5 kB", in 1024-byte steps with one
 * decimal, through `Intl.NumberFormat` units so it follows the locale.
 */
export function formatSize(bytes: number, locale?: string): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}
