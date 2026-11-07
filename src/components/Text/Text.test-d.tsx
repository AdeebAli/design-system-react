import { Text } from './index';

test('as follows the element', () => {
  <Text as="label" htmlFor="x" />;
  // @ts-expect-error a p has no htmlFor
  <Text htmlFor="x" />;
});

test('values come from the scale', () => {
  <Text size={{ base: 'sm', md: '5xl' }} lineClamp="6" tone="muted" />;
  // @ts-expect-error not a size
  <Text size="6xl" />;
  // @ts-expect-error lineClamp starts at 2
  <Text lineClamp="1" />;
  // @ts-expect-error lineClamp is a string
  <Text lineClamp={2} />;
  // @ts-expect-error neutral isn't a tone
  <Text tone="neutral" />;
  // @ts-expect-error color isn't accepted
  <Text color="red" />;
  // @ts-expect-error padding isn't accepted
  <Text padding="2" />;
});
