import { CONTRAST_PAIRS, contrastFailures, contrastRatio } from './contrast';
import { softDark } from './softDark';
import { softLight } from './softLight';

it.each([
  ['softLight', softLight],
  ['softDark', softDark],
])('%s meets every declared pair', (_, theme) => {
  expect(contrastFailures(theme, CONTRAST_PAIRS)).toEqual([]);
});

it('computes black on white', () => {
  expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
});

it('parses rgb()', () => {
  expect(contrastRatio('rgb(255 255 255)', 'rgb(0 0 0)')).toBeCloseTo(21);
});

it('covers Spec 02 pairs and thresholds', () => {
  expect(CONTRAST_PAIRS).toContainEqual({
    fg: 'color.fg.muted',
    bg: 'color.bg.canvas',
    min: 4.5,
  });
  expect(CONTRAST_PAIRS).toContainEqual({
    fg: 'color.border.control',
    bg: 'color.bg.sunken',
    min: 3,
  });
  expect(CONTRAST_PAIRS).toContainEqual({
    fg: 'color.bg.warning',
    bg: 'color.bg.muted',
    min: 3,
  });
});

it('covers text on the selected-row background', () => {
  for (const fg of ['color.fg.default', 'color.fg.muted']) {
    expect(CONTRAST_PAIRS).toContainEqual({
      fg,
      bg: 'color.bg.accentSubtle',
      min: 4.5,
    });
  }
});

it('covers each avatar pair (Spec 16)', () => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    expect(CONTRAST_PAIRS).toContainEqual({
      fg: `color.fg.avatar.${n}`,
      bg: `color.bg.avatar.${n}`,
      min: 4.5,
    });
  }
});

it('reports a failing pair', () => {
  const theme = {
    ...softLight,
    color: {
      ...softLight.color,
      fg: { ...softLight.color.fg, default: '#f4f2ee' },
    },
  };
  expect(contrastFailures(theme, CONTRAST_PAIRS).join()).toContain(
    'color.fg.default on color.bg.canvas',
  );
});
