import { EmptyState } from './index';

test('requires a title and accepts layout props', () => {
  <EmptyState title="x" marginTop="4" />;
  <EmptyState title="x" headingLevel={2} size="sm" />;
  // @ts-expect-error title is required
  <EmptyState />;
  // @ts-expect-error headingLevel is 1 to 6
  <EmptyState title="x" headingLevel={7} />;
  // @ts-expect-error icon takes an element, not a component
  <EmptyState title="x" icon="search" />;
});
