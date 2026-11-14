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
