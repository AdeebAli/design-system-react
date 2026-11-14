const REACT_ELEMENT = 'ReactElement<unknown, string | JSXElementConstructor<any>>';

/**
 * Reads three React types back as their names in a props table's type cell,
 * after react-docgen-typescript expands unions (Spec 18, Props tables).
 */
export function collapseTypeSummary(summary: string): string {
  // ElementType expands to every intrinsic tag name.
  if (summary.includes('"abbr" | "address"')) return 'ElementType';
  const collapsed = summary.replaceAll(REACT_ELEMENT, 'ReactElement');
  // ReactNode expands to its members, of which these two are unique to it.
  if (
    collapsed.includes('Iterable<ReactNode>') &&
    collapsed.includes('Promise<AwaitedReactNode>')
  ) {
    return 'ReactNode';
  }
  return collapsed;
}
