import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findRawValues } from './check-raw-values.mjs';

test('flags colors, px lengths, and shadow literals', () => {
  assert.equal(findRawValues("color: '#ff0000',").length, 1);
  assert.equal(findRawValues("color: 'rgb(0 0 0)',").length, 1);
  assert.equal(findRawValues("padding: '12px',").length, 1);
  assert.equal(findRawValues("boxShadow: '0 1px 2px black',").length, 1);
});

test('allows tokens, 0, 100%, 1px, and em', () => {
  assert.deepEqual(findRawValues('color: vars.color.fg.default,'), []);
  assert.deepEqual(findRawValues("width: '100%', margin: 0,"), []);
  assert.deepEqual(
    findRawValues("borderBottom: '1px solid currentColor',"),
    [],
  );
  assert.deepEqual(findRawValues("fontSize: '0.88em',"), []);
  assert.deepEqual(findRawValues('boxShadow: vars.shadow.card,'), []);
});

test('allows system colors inside forced-colors blocks', () => {
  const source = `'@media': {
  '(forced-colors: active)': {
    color: '#000000',
  },
},`;
  assert.deepEqual(findRawValues(source), []);
});

test('still flags a value after a forced-colors block', () => {
  const source = `'(forced-colors: active)': {
  color: '#000000',
},
padding: '4px',`;
  assert.equal(findRawValues(source).length, 1);
});
