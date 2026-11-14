const REACT_ELEMENT =
  'ReactElement<unknown, string | JSXElementConstructor<any>>';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

/**
 * Splits a union on its top-level `|`, leaving nested types, quoted strings,
 * and template literals whole. The `>` of an arrow (`=>`) isn't a closer.
 */
function split(union: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < union.length; i++) {
    const char = union[i];
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === '=' && union[i + 1] === '>') {
      i++;
    } else if ('<{(['.includes(char!)) {
      depth++;
    } else if ('>})]'.includes(char!)) {
      depth = Math.max(0, depth - 1);
    } else if (char === separator && depth === 0) {
      parts.push(union.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(union.slice(start).trim());
  return parts;
}

const members = (union: string) => split(union, '|');

/**
 * Sorts the unions inside an object member's property types, such as a
 * responsive value's `{ base?: …; sm?: …; }`. Property order stays as
 * declared.
 */
function sortObject(member: string): string {
  const body = /^\{(.*)\}$/s.exec(member)?.[1];
  if (body === undefined) return member;
  const properties = split(body, ';')
    .filter((part) => part !== '')
    .map((part) => {
      const colon = part.indexOf(':');
      if (colon === -1) return part;
      return `${part.slice(0, colon + 1)} ${sortUnion(part.slice(colon + 1).trim())}`;
    });
  return `{ ${properties.join('; ')}; }`;
}

// Numbers (with px between 0 and 0.5) and sizes in their natural order, then
// other strings alphabetically, then everything that isn't a string literal.
function rank(member: string): [number, number, string] {
  const literal = /^"(.*)"$/.exec(member)?.[1];
  if (literal === undefined) return [3, 0, member];
  if (literal === 'px') return [0, 0.25, literal];
  if (/^-?\d+(\.\d+)?$/.test(literal)) return [0, Number(literal), literal];
  if (SIZES.includes(literal)) return [1, SIZES.indexOf(literal), literal];
  return [2, 0, literal];
}

/**
 * Orders a union's members. react-docgen-typescript lists them in the type
 * checker's internal order, which differs between builds, so the same page
 * would render differently each time.
 */
function sortUnion(summary: string): string {
  const parts = members(summary).map(sortObject);
  if (parts.length < 2) return parts[0] ?? summary;
  return parts
    .map((member) => ({ member, key: rank(member) }))
    .sort(
      (a, b) =>
        a.key[0] - b.key[0] ||
        a.key[1] - b.key[1] ||
        (a.key[2] < b.key[2] ? -1 : a.key[2] > b.key[2] ? 1 : 0),
    )
    .map(({ member }) => member)
    .join(' | ');
}

/**
 * Reads three React types back as their names in a props table's type cell,
 * after react-docgen-typescript expands unions (Spec 18, Props tables).
 */
export function collapseTypeSummary(summary: string): string {
  // ElementType expands to every intrinsic tag name, in any order.
  const all = members(summary);
  if (all.includes('"abbr"') && all.includes('"address"')) return 'ElementType';
  const collapsed = summary.replaceAll(REACT_ELEMENT, 'ReactElement');
  // ReactNode expands to its members, of which these two are unique to it.
  if (
    collapsed.includes('Iterable<ReactNode>') &&
    collapsed.includes('Promise<AwaitedReactNode>')
  ) {
    return 'ReactNode';
  }
  return sortUnion(collapsed);
}
