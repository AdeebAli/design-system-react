import { mergeFiles } from './mergeFiles';

const file = (name: string, size = 10, type = '', lastModified = 1) =>
  new File([new Uint8Array(size)], name, { type, lastModified });

const names = (files: File[]) => files.map((f) => f.name);

it('multiple appends', () => {
  const a = file('a.txt');
  const b = file('b.txt');
  const c = file('c.txt');
  expect(names(mergeFiles([a], [b, c], { multiple: true }).files)).toEqual([
    'a.txt',
    'b.txt',
    'c.txt',
  ]);
});

it('single replaces', () => {
  const a = file('a.txt');
  const b = file('b.txt');
  expect(names(mergeFiles([a], [b], { multiple: false }).files)).toEqual([
    'b.txt',
  ]);
});

it('single takes the first file of a multi-file drop and rejects the rest by count', () => {
  const b = file('b.txt');
  const c = file('c.txt');
  const result = mergeFiles([], [b, c], { multiple: false });
  expect(names(result.files)).toEqual(['b.txt']);
  expect(result.rejections).toEqual([{ file: c, reason: 'count' }]);
});

it.each([
  ['.pdf', 'report.PDF', '', true],
  ['.pdf', 'report.pdf.exe', '', false],
  ['application/pdf', 'x', 'application/pdf', true],
  ['application/pdf', 'x', 'application/zip', false],
  ['IMAGE/*', 'x', 'image/png', true],
  ['image/*', 'x', 'video/mp4', false],
  ['.PDF, image/png', 'shot', 'image/png', true],
  ['.pdf,image/png', 'notes.txt', 'text/plain', false],
])('accept %j with %s (%s) accepts: %s', (accept, name, type, ok) => {
  const f = file(name, 10, type);
  const result = mergeFiles([], [f], { multiple: true, accept });
  expect(result.files).toEqual(ok ? [f] : []);
  expect(result.rejections).toEqual(ok ? [] : [{ file: f, reason: 'type' }]);
});

it('maxSize rejects a larger file by size, and keeps one at the limit', () => {
  const small = file('small.txt', 100);
  const big = file('big.txt', 101);
  const result = mergeFiles([], [small, big], { multiple: true, maxSize: 100 });
  expect(result.files).toEqual([small]);
  expect(result.rejections).toEqual([{ file: big, reason: 'size' }]);
});

it('checks type before size', () => {
  const f = file('big.exe', 500);
  const result = mergeFiles([], [f], {
    multiple: true,
    accept: '.pdf',
    maxSize: 100,
  });
  expect(result.rejections).toEqual([{ file: f, reason: 'type' }]);
});

it('skips duplicates silently, by name, size, and last-modified time', () => {
  const a = file('a.txt', 10, '', 5);
  const same = file('a.txt', 10, '', 5);
  const newer = file('a.txt', 10, '', 6);
  const result = mergeFiles([a], [same, newer], { multiple: true });
  expect(result.files).toEqual([a, newer]);
  expect(result.rejections).toEqual([]);
});

it('skips a duplicate within one drop', () => {
  const a = file('a.txt', 10, '', 5);
  const same = file('a.txt', 10, '', 5);
  expect(mergeFiles([], [a, same], { multiple: true }).files).toEqual([a]);
});

it('maxFiles: two files and a three-file drop keeps the first, and rejects the others by count in drop order', () => {
  const current = [file('one.txt'), file('two.txt')];
  const [x, y, z] = [file('x.txt'), file('y.txt'), file('z.txt')];
  const result = mergeFiles(current, [x, y, z], {
    multiple: true,
    maxFiles: 3,
  });
  expect(names(result.files)).toEqual(['one.txt', 'two.txt', 'x.txt']);
  expect(result.rejections).toEqual([
    { file: y, reason: 'count' },
    { file: z, reason: 'count' },
  ]);
});

it('a rejected file does not use up the count', () => {
  const bad = file('bad.exe');
  const ok = file('ok.pdf');
  const result = mergeFiles([], [bad, ok], {
    multiple: true,
    accept: '.pdf',
    maxFiles: 1,
  });
  expect(result.files).toEqual([ok]);
  expect(result.rejections).toEqual([{ file: bad, reason: 'type' }]);
});

it('does not change the current list', () => {
  const current = [file('a.txt')];
  mergeFiles(current, [file('b.txt')], { multiple: true });
  expect(names(current)).toEqual(['a.txt']);
});

it('single keeps the current file when nothing in the drop is accepted', () => {
  const a = file('a.pdf');
  const bad = file('b.exe');
  const result = mergeFiles([a], [bad], { multiple: false, accept: '.pdf' });
  expect(result.files).toEqual([a]);
  expect(result.rejections).toEqual([{ file: bad, reason: 'type' }]);
});
