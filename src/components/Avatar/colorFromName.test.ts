import { avatarColorIndex } from './colorFromName';

const names = Array.from({ length: 50 }, (_, index) => `Person ${index}`);

it('gives the same index for the same name', () => {
  for (const name of names) {
    expect(avatarColorIndex(name)).toBe(avatarColorIndex(name));
  }
});

it('returns 1 to 6', () => {
  for (const name of [...names, '', '👩‍💻', 'Đặng Văn']) {
    expect([1, 2, 3, 4, 5, 6]).toContain(avatarColorIndex(name));
  }
});

it('spreads 50 sample names over all six', () => {
  expect(new Set(names.map(avatarColorIndex)).size).toBe(6);
});

it('is fixed across releases for a known name', () => {
  // Changing the hash recolors every user's avatar, so it's pinned.
  expect(avatarColorIndex('Ada Park')).toBe(4);
  expect(avatarColorIndex('Grace Hopper')).toBe(2);
  expect(avatarColorIndex('Northwind Labs')).toBe(1);
});
