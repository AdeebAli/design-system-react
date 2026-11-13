import { formatSize } from './formatSize';

it('formats bytes with Intl units', () => {
  expect(formatSize(0, 'en-US')).toBe(
    new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(0),
  );
  expect(formatSize(1023, 'en-US')).toBe('1,023 byte');
});

it('uses kilobytes from 1024 bytes, with one decimal', () => {
  expect(formatSize(1024, 'en-US')).toBe('1 kB');
  expect(formatSize(1536, 'en-US')).toBe('1.5 kB');
  expect(formatSize(1587, 'en-US')).toBe('1.5 kB');
});

it('uses megabytes and gigabytes', () => {
  expect(formatSize(5 * 1024 ** 2, 'en-US')).toBe('5 MB');
  expect(formatSize(2.25 * 1024 ** 3, 'en-US')).toBe('2.3 GB');
});

it('follows the locale', () => {
  expect(formatSize(1536, 'de-DE')).toBe('1,5 kB');
});
