// Reads which characters a WOFF2 font contains, so the build can derive each
// font file's unicode-range instead of hardcoding it (Spec 02).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';

// WOFF2's known table tags, by the index its table directory uses.
const KNOWN_TAGS = [
  'cmap',
  'head',
  'hhea',
  'hmtx',
  'maxp',
  'name',
  'OS/2',
  'post',
  'cvt ',
  'fpgm',
  'glyf',
  'loca',
  'prep',
  'CFF ',
  'VORG',
  'EBDT',
  'EBLC',
  'gasp',
  'hdmx',
  'kern',
  'LTSH',
  'PCLT',
  'VDMX',
  'vhea',
  'vmtx',
  'BASE',
  'GDEF',
  'GPOS',
  'GSUB',
  'EBSC',
  'JSTF',
  'MATH',
  'CBDT',
  'CBLC',
  'COLR',
  'CPAL',
  'SVG ',
  'sbix',
  'acnt',
  'avar',
  'bdat',
  'bloc',
  'bsln',
  'cvar',
  'fdsc',
  'feat',
  'fmtx',
  'fvar',
  'gvar',
  'hsty',
  'just',
  'lcar',
  'mort',
  'morx',
  'opbd',
  'prop',
  'trak',
  'Zapf',
  'Silf',
  'Glat',
  'Gloc',
  'Feat',
  'Sill',
];

function readBase128(bytes, at) {
  let value = 0;
  for (let i = 0; i < 5; i += 1) {
    const byte = bytes[at + i];
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return [value, at + i + 1];
  }
  throw new Error('Invalid UIntBase128 in WOFF2 table directory');
}

function cmapTable(file) {
  const bytes = readFileSync(file);
  if (bytes.toString('latin1', 0, 4) !== 'wOF2') {
    throw new Error(`${file} isn't a WOFF2 font`);
  }
  const numTables = bytes.readUInt16BE(12);
  const compressedSize = bytes.readUInt32BE(20);
  let at = 48;
  const tables = [];
  for (let i = 0; i < numTables; i += 1) {
    const flags = bytes[at];
    at += 1;
    let tag = KNOWN_TAGS[flags & 0x3f];
    if ((flags & 0x3f) === 63) {
      tag = bytes.toString('latin1', at, at + 4);
      at += 4;
    }
    let length;
    [length, at] = readBase128(bytes, at);
    const version = flags >> 6;
    // glyf and loca are transformed at version 0; other tables at any other.
    const transformed =
      tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    if (transformed) [length, at] = readBase128(bytes, at);
    tables.push({ tag, length });
  }
  const data = brotliDecompressSync(bytes.subarray(at, at + compressedSize));
  let offset = 0;
  for (const { tag, length } of tables) {
    if (tag === 'cmap') return data.subarray(offset, offset + length);
    offset += length;
  }
  throw new Error(`${file} has no cmap table`);
}

function format12(table, at, points) {
  const groups = table.readUInt32BE(at + 12);
  for (let i = 0; i < groups; i += 1) {
    const group = at + 16 + i * 12;
    const start = table.readUInt32BE(group);
    const end = table.readUInt32BE(group + 4);
    const glyph = table.readUInt32BE(group + 8);
    for (let code = start; code <= end; code += 1) {
      if (glyph + code - start !== 0) points.add(code);
    }
  }
}

function format4(table, at, points) {
  const segments = table.readUInt16BE(at + 6) / 2;
  const ends = at + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const rangeOffsets = deltas + segments * 2;
  for (let i = 0; i < segments; i += 1) {
    const start = table.readUInt16BE(starts + i * 2);
    const end = table.readUInt16BE(ends + i * 2);
    const delta = table.readInt16BE(deltas + i * 2);
    const rangeOffsetAt = rangeOffsets + i * 2;
    const rangeOffset = table.readUInt16BE(rangeOffsetAt);
    for (let code = start; code <= end && code !== 0xffff; code += 1) {
      let glyph = code;
      if (rangeOffset !== 0) {
        glyph = table.readUInt16BE(
          rangeOffsetAt + rangeOffset + (code - start) * 2,
        );
        if (glyph === 0) continue;
      }
      if ((glyph + delta) & 0xffff) points.add(code);
    }
  }
}

/** Every code point the font maps to a glyph. */
export function readCmap(file) {
  const table = cmapTable(file);
  const subtables = new Map();
  for (let i = 0; i < table.readUInt16BE(2); i += 1) {
    const record = 4 + i * 8;
    const key = `${table.readUInt16BE(record)}/${table.readUInt16BE(record + 2)}`;
    subtables.set(key, table.readUInt32BE(record + 4));
  }
  const points = new Set();
  // Prefer a full-Unicode subtable, then a Basic Multilingual Plane one.
  for (const key of ['3/10', '0/4', '0/6', '3/1', '0/3']) {
    const at = subtables.get(key);
    if (at === undefined) continue;
    const format = table.readUInt16BE(at);
    if (format === 12) format12(table, at, points);
    else if (format === 4) format4(table, at, points);
    else continue;
    return points;
  }
  throw new Error('No supported Unicode cmap subtable');
}

/** Parses a CSS unicode-range value into code points. */
export function parseUnicodeRange(range) {
  const points = new Set();
  for (const part of range.split(',')) {
    const [start, end = start] = part.trim().slice(2).split('-');
    for (let code = parseInt(start, 16); code <= parseInt(end, 16); code += 1) {
      points.add(code);
    }
  }
  return points;
}

const hex = (code) => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;

/** Formats code points as a compact CSS unicode-range value. */
export function formatUnicodeRange(points) {
  const sorted = [...points].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; i += 1) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j += 1;
    parts.push(
      i === j ? hex(sorted[i]) : `${hex(sorted[i])}-${hex(sorted[j]).slice(2)}`,
    );
    i = j;
  }
  return parts.join(',');
}

/** The unicode-range of one subset in a Fontsource package's CSS. */
export function fontsourceRange(pkg, cssFile, prefix, subset, variant) {
  const css = readFileSync(join('node_modules', pkg, cssFile), 'utf8');
  const file = `${prefix}-${subset}-${variant}.woff2`;
  const block = css.split('@font-face').find((part) => part.includes(file));
  const range = block && /unicode-range:\s*([^;]+);/.exec(block)?.[1];
  if (!range) {
    throw new Error(`No unicode-range for ${file} in ${pkg}/${cssFile}`);
  }
  return range;
}

export const INTER_FILES = {
  normal: {
    latin: 'variable-latin/InterVariable-subset.woff2',
    extended: 'variable/InterVariable.woff2',
  },
  italic: {
    latin: 'variable-latin/InterVariable-Italic-subset.woff2',
    extended: 'variable/InterVariable-Italic.woff2',
  },
};

/**
 * Inter's two files per style, as unicode-ranges. The latin and latin-ext
 * subsets are the standard ones, read from Source Serif 4's Fontsource CSS.
 * The Latin subset file covers what it can, and the full file the rest.
 */
export function interRanges(style) {
  const variant = style === 'italic' ? 'opsz-italic' : 'opsz-normal';
  const css = style === 'italic' ? 'opsz-italic.css' : 'opsz.css';
  const serif = '@fontsource-variable/source-serif-4';
  const wanted = new Set([
    ...parseUnicodeRange(
      fontsourceRange(serif, css, 'source-serif-4', 'latin', variant),
    ),
    ...parseUnicodeRange(
      fontsourceRange(serif, css, 'source-serif-4', 'latin-ext', variant),
    ),
  ]);
  const files = INTER_FILES[style];
  const subset = readCmap(join('node_modules', 'inter-ui', files.latin));
  const full = readCmap(join('node_modules', 'inter-ui', files.extended));
  const latin = new Set([...wanted].filter((code) => subset.has(code)));
  const extended = new Set(
    [...wanted].filter((code) => !subset.has(code) && full.has(code)),
  );
  return {
    latin: formatUnicodeRange(latin),
    extended: formatUnicodeRange(extended),
  };
}
