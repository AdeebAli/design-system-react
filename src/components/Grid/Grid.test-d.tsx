import { Grid } from './index';

test('columns are strings, and autoRows is not responsive', () => {
  <Grid columns={{ base: '2', md: '4' }} autoRows="equal" />;
  // @ts-expect-error columns are strings
  <Grid columns={4} />;
  // @ts-expect-error 13 isn't a column count
  <Grid columns="13" />;
  // @ts-expect-error autoRows isn't responsive
  <Grid autoRows={{ md: 'equal' }} />;
  // @ts-expect-error layout components don't accept padding
  <Grid padding="2" />;
});
