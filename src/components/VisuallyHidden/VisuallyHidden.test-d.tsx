import { VisuallyHidden } from './index';

test('as follows the element', () => {
  <VisuallyHidden as="a" href="#main" focusable />;
  // @ts-expect-error a span has no href
  <VisuallyHidden href="#main" />;
});
