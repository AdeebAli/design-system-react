import type { LayoutProps } from '../components/Box/types';

const LAYOUT_PROPS = new Set<string>([
  'margin',
  'marginX',
  'marginY',
  'marginTop',
  'marginBottom',
  'marginStart',
  'marginEnd',
  'width',
  'minWidth',
  'height',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'flexGrow',
  'flexShrink',
  'alignSelf',
  'justifySelf',
  'gridColumn',
  'gridRow',
] satisfies (keyof LayoutProps)[]);

/** Separates layout props from the rest, for elements a wrapper doesn't render itself. */
export function splitLayoutProps<P extends object>(
  props: P,
): [LayoutProps, Omit<P, keyof LayoutProps>] {
  const layout: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    (LAYOUT_PROPS.has(name) ? layout : rest)[name] = value;
  }
  return [layout as LayoutProps, rest as Omit<P, keyof LayoutProps>];
}
