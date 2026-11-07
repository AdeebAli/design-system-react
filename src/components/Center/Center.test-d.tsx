import { Center } from './index';

test('padding is an error, and height is a layout prop', () => {
  <Center height="full" />;
  // @ts-expect-error layout components don't accept padding
  <Center padding="2" />;
  // @ts-expect-error not an axis
  <Center axis="diagonal" />;
});
