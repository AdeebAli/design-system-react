import { Stack } from './index';

test('as follows the element', () => {
  <Stack as="a" href="/x" />;
  // @ts-expect-error a div has no href
  <Stack href="/x" />;
});

test('padding and direction are errors', () => {
  // @ts-expect-error layout components don't accept padding
  <Stack padding="2" />;
  // @ts-expect-error Stack has no direction
  <Stack direction="row" />;
});
