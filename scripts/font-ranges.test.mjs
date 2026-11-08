import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatUnicodeRange,
  interRanges,
  parseUnicodeRange,
  readCmap,
} from './font-ranges.mjs';

const dir = 'node_modules/inter-ui';

test('reads every code point in a WOFF2 font, matching fontTools', () => {
  const subset = readCmap(`${dir}/variable-latin/InterVariable-subset.woff2`);
  const full = readCmap(`${dir}/variable/InterVariable.woff2`);
  assert.equal(subset.size, 283);
  assert.equal(full.size, 2852);
  assert.ok(subset.has(0x41));
  assert.ok(!subset.has(0x100));
  assert.ok(full.has(0x100));
});

test('formats and parses unicode-range strings', () => {
  const points = new Set([0x20, 0x21, 0x22, 0x41, 0x100, 0x101]);
  const range = formatUnicodeRange(points);
  assert.equal(range, 'U+0020-0022,U+0041,U+0100-0101');
  assert.deepEqual(parseUnicodeRange(range), points);
});

// Read from inter-ui 4.1.1 with fontTools. A newer inter-ui may change these,
// and the build follows the files, so update them after checking the new ones.
const verified = {
  latin:
    'U+0000,U+0020-007E,U+00A0-00AC,U+00AE-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-200B,U+2010-2027,U+202F-2055,U+2057,U+205F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+FEFF',
  extended:
    'U+0100-0130,U+0132-0148,U+014A-0151,U+0154-01C3,U+01C5-0254,U+0256-027B,U+027E-0284,U+0286-0290,U+0292-02A4,U+02A6-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+1D00,U+1D0D,U+1D1B,U+1D43,U+1D47-1D49,U+1D4D,U+1D4F-1D50,U+1D52,U+1D56-1D58,U+1D5B,U+1D62-1D65,U+1D9C,U+1DA0,U+1DBB,U+1DBF,U+1E00-1E9B,U+1E9D-1E9F,U+1EF2-1EFF,U+20A0-20AB,U+20AD-20AF,U+20B1-20B5,U+20B8-20BA,U+20BC-20C0,U+2113,U+2C7C,U+2C7F,U+A7FF',
};

for (const style of ['normal', 'italic']) {
  test(`Inter's ${style} ranges match the verified values`, () => {
    assert.deepEqual(interRanges(style), verified);
  });
}
