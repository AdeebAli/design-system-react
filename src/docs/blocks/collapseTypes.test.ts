import { collapseTypeSummary } from './collapseTypes';

// The props tables expand unions (Spec 18 spike), which also expands three
// React types into long lists. These read them back as their names.
it('collapses ElementType to its name', () => {
  expect(
    collapseTypeSummary(
      '"symbol" | "object" | "a" | "abbr" | "address" | "area"',
    ),
  ).toBe('ElementType');
});

it('collapses an expanded ReactNode', () => {
  expect(
    collapseTypeSummary(
      'null | string | number | bigint | false | true | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode>',
    ),
  ).toBe('ReactNode');
});

it('collapses ReactElement type arguments', () => {
  expect(
    collapseTypeSummary(
      'ReactElement<unknown, string | JSXElementConstructor<any>>',
    ),
  ).toBe('ReactElement');
});

it('leaves token unions and responsive objects alone', () => {
  const margin =
    '"0" | "px" | "auto" | { base?: MarginValue | undefined; sm?: MarginValue | undefined; }';
  expect(collapseTypeSummary(margin)).toBe(margin);
});

// react-docgen-typescript lists a union's members in the checker's internal
// order, which differs between builds, so the visual baselines of every docs
// page with a union changed from one build to the next.
it('orders union members the same way whatever order they come in', () => {
  const a = collapseTypeSummary('"accent" | "neutral" | "danger" | "success"');
  const b = collapseTypeSummary('"success" | "danger" | "accent" | "neutral"');
  expect(a).toBe(b);
  expect(a).toBe('"accent" | "danger" | "neutral" | "success"');
});

it('keeps sizes and numbers in their natural order', () => {
  expect(collapseTypeSummary('"lg" | "sm" | "xl" | "md" | "xs"')).toBe(
    '"xs" | "sm" | "md" | "lg" | "xl"',
  );
  expect(collapseTypeSummary('"12" | "px" | "0.5" | "2" | "0" | "auto"')).toBe(
    '"0" | "px" | "0.5" | "2" | "12" | "auto"',
  );
});

it('sorts only the top level, and keeps object members last', () => {
  expect(
    collapseTypeSummary(
      '{ base?: MarginValue | undefined; sm?: MarginValue | undefined; } | "4" | "0"',
    ),
  ).toBe(
    '"0" | "4" | { base?: MarginValue | undefined; sm?: MarginValue | undefined; }',
  );
});

// Every order of the same members gives one output.
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (rest) => [item, ...rest],
    ),
  );
}

it.each([
  [['((e: Event) => void)', '"b"', '"a"', 'undefined']],
  [['"a|b"', '"a"', '"0"']],
  [['"["', '"b"', '"a"']],
  [['`x-${string}`', '"md"', '"sm"']],
  [['"-1"', '"2"', '""', 'true', 'false']],
])('gives one output for every order of %j', (items) => {
  const outputs = new Set(
    permutations(items).map((order) => collapseTypeSummary(order.join(' | '))),
  );
  expect(outputs.size).toBe(1);
});

it('keeps a quoted | inside its member', () => {
  expect(collapseTypeSummary('"a|b" | "0"')).toBe('"0" | "a|b"');
});

it('collapses ElementType whatever order its members come in', () => {
  expect(
    collapseTypeSummary('"address" | "a" | "symbol" | "object" | "abbr"'),
  ).toBe('ElementType');
});

it('ranks only plain decimals as numbers', () => {
  expect(collapseTypeSummary('"1e3" | "2" | " " | "0x10"')).toBe(
    '"2" | " " | "0x10" | "1e3"',
  );
});

it('keeps an arrow type inside an object member whole', () => {
  expect(
    collapseTypeSummary('{ onChange: (e: Event) => void | null; } | "b" | "a"'),
  ).toBe('"a" | "b" | { onChange: (e: Event) => void | null; }');
});

it.each([
  [['{ base?: "y" | "x" | undefined; sm?: "b" | "a"; }', '"0"']],
  [['{ base?: "x" | undefined | "y"; sm?: "a" | "b"; }', '"0"']],
])('sorts unions inside object members too: %j', (items) => {
  expect(collapseTypeSummary(items.join(' | '))).toBe(
    '"0" | { base?: "x" | "y" | undefined; sm?: "a" | "b"; }',
  );
});

it('gives one output for arrow members that return generics', () => {
  const items = ['(() => Promise<void>)', '"b"', '"a"'];
  const outputs = new Set(
    permutations(items).map((order) => collapseTypeSummary(order.join(' | '))),
  );
  expect([...outputs]).toEqual(['"a" | "b" | (() => Promise<void>)']);
});

// Shapes the object sort must leave exactly as they are.
it.each([
  ['{ [key: string]: "b" | "a"; }'],
  ['{ onChange(e: X | "a"): void; }'],
  ['{ a?: { x: 2 | 1; } & { y: 4 | 3; }; }'],
  ['{}'],
  // A colon inside a quoted name stays put (its type is already sorted).
  ['{ "a:b": 0 | 1; }'],
  ['{ a: string } & { b: number }'],
])('leaves %s unchanged', (member) => {
  expect(collapseTypeSummary(`"0" | ${member}`)).toBe(`"0" | ${member}`);
});
