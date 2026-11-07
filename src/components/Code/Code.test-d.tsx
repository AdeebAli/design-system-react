import { Code } from './index';

test('as is not accepted', () => {
  <Code marginStart="1" />;
  // @ts-expect-error Code doesn't accept as
  <Code as="span" />;
});
