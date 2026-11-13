import { createRef } from 'react';
import { Combobox } from './index';

const options = [{ value: 'a', label: 'A' }];

test('onValueChange receives string | null', () => {
  <Combobox
    options={options}
    onValueChange={(value) => {
      expectTypeOf(value).toEqualTypeOf<string | null>();
    }}
  />;
  // @ts-expect-error the value is a string, not a list
  <Combobox options={options} value={['a']} />;
});

test('ref is the input', () => {
  <Combobox options={options} ref={createRef<HTMLInputElement>()} />;
  // @ts-expect-error not a button
  <Combobox options={options} ref={createRef<HTMLButtonElement>()} />;
});

test('options are required', () => {
  // @ts-expect-error options is required
  <Combobox />;
});
