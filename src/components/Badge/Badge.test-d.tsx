import { Badge } from './index';

test('as and visual Box props are not accepted', () => {
  <Badge tone="success" marginStart="1">
    Active
  </Badge>;
  // @ts-expect-error Badge doesn't accept as
  <Badge as="div">x</Badge>;
  // @ts-expect-error padding isn't a Badge prop
  <Badge padding="2">x</Badge>;
});
