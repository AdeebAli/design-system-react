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

it("doesn't depend on the host's locale, so server and client agree", () => {
  // A host whose default locale is Turkish uppercases a dotted i to İ.
  const turkish = vi
    .spyOn(String.prototype, 'toLocaleUpperCase')
    .mockImplementation(function (this: string) {
      return this.replace(/i/g, 'İ').toUpperCase();
    });
  try {
    expect(initials('ilker Ak')).toBe('IA');
  } finally {
    turkish.mockRestore();
  }
});

it('keeps a combining mark with its letter', () => {
  // "E" followed by a combining acute accent, not the precomposed É.
  expect(initials('Émile Zola')).toBe('ÉZ');
});
