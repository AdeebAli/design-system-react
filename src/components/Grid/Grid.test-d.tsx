import type { GridCount, Responsive } from '../Box/types';
import { Grid, type GridProps } from './index';

test('columns take numbers and numeric strings, and autoRows is not responsive', () => {
  <Grid columns={{ base: '2', md: '4' }} autoRows="equal" />;
  <Grid columns={4} />;
  <Grid columns={16} />;
  <Grid columns="16" />;
  <Grid columns={{ base: 2, md: 16 }} />;
  // @ts-expect-error not a count
  <Grid columns="many" />;
  // @ts-expect-error autoRows isn't responsive
  <Grid autoRows={{ md: 'equal' }} />;
  // @ts-expect-error layout components don't accept padding
  <Grid padding="2" />;
});

test('the written-out columns type stays equal to GridCount', () => {
  expectTypeOf<NonNullable<GridProps['columns']>>().toEqualTypeOf<
    Responsive<GridCount>
  >();
});
