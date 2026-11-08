import { Inset } from './index';

test('takes spacing tokens through its own names', () => {
  <Inset space={{ base: '2', md: '4' }} x="1" />;
  // @ts-expect-error use space
  <Inset padding="2" />;
  // @ts-expect-error tokens only
  <Inset space="13px" />;
});
