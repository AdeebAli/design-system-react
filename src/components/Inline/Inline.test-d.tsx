import { Inline } from './index';

test('padding is an error, and as follows the element', () => {
  <Inline as="a" href="/x" />;
  // @ts-expect-error layout components don't accept padding
  <Inline paddingX="2" />;
});
