import { Kbd } from './index';

test('as is not accepted', () => {
  <Kbd marginStart="1" />;
  // @ts-expect-error Kbd doesn't accept as
  <Kbd as="span" />;
});
