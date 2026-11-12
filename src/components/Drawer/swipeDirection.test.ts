import { toSwipeDirection } from './swipeDirection';

it.each([
  ['start', 'ltr', 'left'],
  ['start', 'rtl', 'right'],
  ['end', 'ltr', 'right'],
  ['end', 'rtl', 'left'],
  ['bottom', 'ltr', 'down'],
  ['bottom', 'rtl', 'down'],
] as const)('%s in %s swipes %s', (side, dir, expected) => {
  expect(toSwipeDirection(side, dir)).toBe(expected);
});
