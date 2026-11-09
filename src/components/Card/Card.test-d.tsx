import { Card } from './index';

test('accepts padding and gap, not other visual Box props', () => {
  <Card padding="lg" gap="3" span={{ base: '1x1', md: '2x1' }} />;
  // @ts-expect-error paddingX isn't a Card prop
  <Card paddingX="4" />;
  // @ts-expect-error background isn't a Card prop
  <Card background="surface" />;
  // @ts-expect-error padding takes named sizes, not space tokens
  <Card padding="4" />;
});
