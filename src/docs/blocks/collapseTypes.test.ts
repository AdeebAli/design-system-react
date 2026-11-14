import { collapseTypeSummary } from './collapseTypes';

// The props tables expand unions (Spec 18 spike), which also expands three
// React types into long lists. These read them back as their names.
it('collapses ElementType to its name', () => {
  expect(
    collapseTypeSummary('"symbol" | "object" | "a" | "abbr" | "address" | "area"'),
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
