import { Spinner } from './index';

test('accepts size, label, and layout props', () => {
  <Spinner />;
  <Spinner size="lg" label="Loading results" marginStart="2" />;
  // @ts-expect-error unknown size
  <Spinner size="xl" />;
  // @ts-expect-error label is a string
  <Spinner label={<b>Loading</b>} />;
  // @ts-expect-error background isn't a Spinner prop
  <Spinner background="surface" />;
  // @ts-expect-error a Spinner has no children
  <Spinner>Loading</Spinner>;
});
