import { softDark } from '../../../index';
import { liftedDarkSurfaces } from './liftedDarkSurfaces';

// The Primitives page's "Do" must visibly change something, without merging
// two background roles into one color.
const overrides = Object.entries(liftedDarkSurfaces.dark?.color?.bg ?? {});
const soft = softDark.color.bg as unknown as Record<string, unknown>;

it('overrides at least one background', () => {
  expect(overrides.length).toBeGreaterThan(0);
});

it.each(overrides)('changes dark %s from Soft Dark', (role, value) => {
  expect(value).not.toBe(soft[role]);
});

it.each(overrides)(
  'keeps dark %s distinct from every other role',
  (role, value) => {
    const merged = { ...soft, ...Object.fromEntries(overrides) };
    const others = Object.entries(merged)
      .filter(([name, other]) => name !== role && typeof other === 'string')
      .map(([, other]) => other);
    expect(others).not.toContain(value);
  },
);
