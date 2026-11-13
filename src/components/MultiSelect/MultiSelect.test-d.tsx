import { createRef } from 'react';
import { MultiSelect } from './index';

const options = [{ value: 'a', label: 'A' }];

test('onValueChange receives string[]', () => {
  <MultiSelect
    options={options}
    onValueChange={(value) => {
      expectTypeOf(value).toEqualTypeOf<string[]>();
    }}
  />;
  // @ts-expect-error the value is a list
  <MultiSelect options={options} value="a" />;
});

test('search props need searchable', () => {
  // @ts-expect-error onSearch without searchable
  <MultiSelect options={options} onSearch={() => undefined} />;
  // @ts-expect-error loading without searchable
  <MultiSelect options={options} loading />;
  // @ts-expect-error selectedOptions without searchable
  <MultiSelect options={options} selectedOptions={[]} />;
});

test('ref is the trigger button by default', () => {
  <MultiSelect options={options} ref={createRef<HTMLButtonElement>()} />;
  // @ts-expect-error not an input
  <MultiSelect options={options} ref={createRef<HTMLInputElement>()} />;
});
