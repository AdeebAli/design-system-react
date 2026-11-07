import type { ThemeTokens } from './types';

export interface ContrastPair {
  fg: string;
  bg: string;
  min: number;
}

const STATUS = ['success', 'warning', 'danger', 'info'] as const;
const SURFACES = ['canvas', 'surface', 'raised', 'sunken'] as const;

function pairs(fgs: readonly string[], bgs: readonly string[], min: number) {
  return fgs.flatMap((fg) => bgs.map((bg) => ({ fg, bg, min })));
}

const surfaces = SURFACES.map((name) => `color.bg.${name}`);
const statusFg = STATUS.map((name) => `color.fg.${name}`);
const statusBg = STATUS.map((name) => `color.bg.${name}`);

/** Spec 02's contrast table, except the avatar row, which arrives in v0.5. */
export const CONTRAST_PAIRS: ContrastPair[] = [
  ...pairs(
    ['color.fg.default', 'color.fg.muted', 'color.fg.accent', ...statusFg],
    surfaces,
    4.5,
  ),
  ...pairs(['color.fg.default', 'color.fg.muted'], ['color.bg.muted'], 4.5),
  ...STATUS.flatMap((name) =>
    pairs(
      [`color.fg.${name}`, 'color.fg.default'],
      [`color.bg.${name}Subtle`],
      4.5,
    ),
  ),
  ...pairs(
    ['color.fg.default', 'color.fg.muted', 'color.fg.accent'],
    ['color.bg.accentSubtle'],
    4.5,
  ),
  ...pairs(
    ['color.fg.onAccent'],
    ['color.bg.accent', 'color.bg.accentHover'],
    4.5,
  ),
  ...pairs(['color.fg.onStatus'], [...statusBg, 'color.bg.dangerHover'], 4.5),
  ...pairs(['color.fg.default'], ['color.bg.mutedHover'], 4.5),
  ...pairs(['color.fg.inverse'], ['color.bg.inverse'], 4.5),
  ...pairs(
    ['color.border.control', 'color.border.danger', 'color.focus'],
    surfaces,
    3,
  ),
  ...pairs(
    ['color.bg.accent', ...statusBg],
    [
      'color.bg.muted',
      'color.bg.canvas',
      'color.bg.surface',
      'color.bg.raised',
    ],
    3,
  ),
];

function channels(color: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex?.[1]) {
    const value = parseInt(hex[1], 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }
  const rgb = /^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(color);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  throw new Error(`Can't parse color: ${color}`);
}

function luminance(color: string) {
  const [r, g, b] = channels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

function resolve(theme: ThemeTokens, path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown>)[key],
      theme,
    );
  if (typeof value !== 'string') throw new Error(`Unknown token: ${path}`);
  const alias = /^var\(--ds-(.+)\)$/.exec(value)?.[1];
  if (!alias) return value;
  // Aliases only point at kebab-case paths under a known group.
  const target = alias.split('-').reduce<string[]>((parts, piece) => {
    const parent = parts.reduce<unknown>(
      (node, key) => (node as Record<string, unknown>)[key],
      theme,
    ) as Record<string, unknown>;
    return piece in parent ? [...parts, piece] : parts;
  }, []);
  return resolve(theme, target.join('.'));
}

/** Pairs below their threshold, as readable strings. */
export function contrastFailures(
  theme: ThemeTokens,
  list: ContrastPair[],
): string[] {
  return list.flatMap(({ fg, bg, min }) => {
    const ratio = contrastRatio(resolve(theme, fg), resolve(theme, bg));
    return ratio < min
      ? [`${fg} on ${bg}: ${ratio.toFixed(2)} (needs ${min})`]
      : [];
  });
}
