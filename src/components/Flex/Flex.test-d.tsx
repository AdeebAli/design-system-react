import { Flex } from './index';

test('as follows the element', () => {
  <Flex as="a" href="/x" />;
  // @ts-expect-error a div has no href
  <Flex href="/x" />;
});

test('padding and raw values are errors', () => {
  // @ts-expect-error layout components don't accept padding
  <Flex padding="2" />;
  // @ts-expect-error gap takes tokens
  <Flex gap="13px" />;
});
