import { initials } from './initials';

it.each([
  ['Ada Park', 'AP'],
  ['Ada', 'A'],
  ['Ada Mae Park', 'AP'],
  ['Đặng Văn', 'ĐV'],
  ['김 민준', '김민'],
  ['  Ada   Park ', 'AP'],
  ['👩‍💻 Dev', '👩‍💻D'],
  ['ada park', 'AP'],
  ['   ', ''],
  ['', ''],
])('%j gives %j', (name, expected) => {
  expect(initials(name)).toBe(expected);
});

it('keeps a combining mark with its letter', () => {
  // "E" followed by a combining acute accent, not the precomposed É.
  expect(initials('Émile Zola')).toBe('ÉZ');
});
