import { vars } from './contract.css';
import { softDark } from './softDark';
import { softLight } from './softLight';
import { tokenToVarName } from './varName';

it.each([
  [['space', '0.5'], '--ds-space-0_5'],
  [['font', 'size', '2xl'], '--ds-font-size-2xl'],
  [['color', 'fg', 'onAccent'], '--ds-color-fg-on-accent'],
  [['size', 'sidebarRail'], '--ds-size-sidebar-rail'],
  [['color', 'bg', 'accentSubtle'], '--ds-color-bg-accent-subtle'],
])('%j becomes %s', (path, name) => {
  expect(tokenToVarName(path)).toBe(name);
});

it('points aliases at their targets', () => {
  expect(softLight.radius.card).toBe('var(--ds-radius-xl)');
  expect(softLight.radius.control).toBe('var(--ds-radius-md)');
  expect(softLight.radius.image).toBe('var(--ds-radius-md)');
  expect(softDark.radius.image).toBe('var(--ds-radius-md)');
  expect(softLight.shadow.card).toBe('var(--ds-shadow-md)');
  expect(softDark.shadow.card).toBe('var(--ds-shadow-sm)');
  expect(softLight.shadow.cardHover).toBe('var(--ds-shadow-lg)');
  expect(softLight.shadow.raised).toBe('var(--ds-shadow-lg)');
  expect(softLight.shadow.dialog).toBe('var(--ds-shadow-xl)');
  expect(softLight.color.fg.accent).toBe('var(--ds-color-bg-accent)');
  expect(softLight.color.focus).toBe('var(--ds-color-bg-accent)');
});

it('exposes vars with the public names', () => {
  expect(vars.color.fg.onAccent).toBe('var(--ds-color-fg-on-accent)');
  expect(vars.space['0.5']).toBe('var(--ds-space-0_5)');
});

it('emits spacing in rem, except the hairline', () => {
  expect(softLight.space['4']).toBe('1rem');
  expect(softLight.space.px).toBe('1px');
  expect(softLight.space['0.5']).toBe('0.125rem');
});

it('has size tokens for the choice controls and chips (Spec 09)', () => {
  expect(softLight.size.checkbox).toBe('1.125rem');
  expect(softLight.size.switch).toEqual({
    width: '2.25rem',
    height: '1.25rem',
  });
  expect(softLight.size.chip).toEqual({ sm: '1.75rem', md: '2rem' });
  expect(vars.size.checkbox).toBe('var(--ds-size-checkbox)');
  expect(vars.size.switch.width).toBe('var(--ds-size-switch-width)');
  expect(vars.size.chip.md).toBe('var(--ds-size-chip-md)');
});

it('has the Spec 02 sizes that Avatar, Drawer, and Sidebar use', () => {
  expect(softLight.size.avatar).toEqual({
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '4rem',
  });
  expect(softLight.size.drawer).toEqual({
    sm: '20rem',
    md: '28rem',
    lg: '40rem',
  });
  expect(softLight.size.sidebar).toBe('15rem');
  expect(softLight.size.sidebarRail).toBe('3.5rem');
  expect(vars.size.avatar.xl).toBe('var(--ds-size-avatar-xl)');
  expect(vars.size.drawer.md).toBe('var(--ds-size-drawer-md)');
});

const AVATAR_PAIRS = ['1', '2', '3', '4', '5', '6'] as const;

it('exposes six avatar color pairs (Spec 16)', () => {
  for (const n of AVATAR_PAIRS) {
    expect(vars.color.bg.avatar[n]).toBe(`var(--ds-color-bg-avatar-${n})`);
    expect(vars.color.fg.avatar[n]).toBe(`var(--ds-color-fg-avatar-${n})`);
  }
});

it.each([
  ['softLight', softLight],
  ['softDark', softDark],
])('%s gives each avatar pair its own background', (_, theme) => {
  const backgrounds = AVATAR_PAIRS.map((n) => theme.color.bg.avatar[n]);
  expect(new Set(backgrounds).size).toBe(6);
});
