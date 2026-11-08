import { Stat } from './index';

test('label and value are required, and as is not accepted', () => {
  <Stat label="L" value="1" marginTop="auto" />;
  // @ts-expect-error value is required
  <Stat label="L" />;
  // @ts-expect-error Stat doesn't accept as
  <Stat label="L" value="1" as="div" />;
});
