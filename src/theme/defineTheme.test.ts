import { softDark } from '../themes/softDark';
import { softLight } from '../themes/softLight';
import { defineFullTheme, defineTheme } from './defineTheme';
import { themeToCss } from './themeToCss';

const accent = { color: { bg: { accent: '#0f766e' } } };

it('emits unlayered rules with mode selectors', () => {
  const css = themeToCss(
    defineTheme({ shared: { radius: { control: '8px' } }, light: accent }),
  );
  expect(css).toContain(':root{--ds-radius-control:8px}');
  expect(css).toContain(
    ":root[data-ds-mode='light']{--ds-color-bg-accent:#0f766e}",
  );
  expect(css).toContain(
    '@media (prefers-color-scheme: light){:root:not([data-ds-mode]){--ds-color-bg-accent:#0f766e}}',
  );
  expect(css).not.toContain('@layer');
});

it('keeps a light override out of the dark rules', () => {
  const css = themeToCss(defineTheme({ light: accent }));
  expect(css).not.toContain("[data-ds-mode='dark']");
  expect(css).not.toContain('prefers-color-scheme: dark');
});

it('keeps a dark override out of the light rules', () => {
  const css = themeToCss(defineTheme({ dark: accent }));
  expect(css).not.toContain("[data-ds-mode='light']");
  expect(css).toContain(
    '@media (prefers-color-scheme: dark){:root:not([data-ds-mode]){--ds-color-bg-accent:#0f766e}}',
  );
});

it('writes mode rules after shared, so mode values win', () => {
  const css = themeToCss(defineTheme({ shared: accent, dark: accent }));
  expect(css.indexOf(':root{')).toBeLessThan(css.indexOf('[data-ds-mode'));
});

it('maps tricky token names', () => {
  const css = themeToCss(
    defineTheme({
      shared: { space: { '0.5': '3px' }, font: { size: { '2xl': '2rem' } } },
    }),
  );
  expect(css).toContain('--ds-space-0_5:3px');
  expect(css).toContain('--ds-font-size-2xl:2rem');
});

it('accepts numbers for unitless tokens', () => {
  const css = themeToCss(defineTheme({ shared: { zIndex: { modal: 10 } } }));
  expect(css).toContain('--ds-z-index-modal:10');
});

it('emits nothing for an empty theme', () => {
  expect(themeToCss(defineTheme({}))).toBe('');
});

it('emits every token for a full theme', () => {
  const css = themeToCss(defineFullTheme({ light: softLight, dark: softDark }));
  expect(css).toContain('--ds-color-bg-canvas:#f4f2ee');
  expect(css).toContain('--ds-color-bg-canvas:#141311');
  expect(css).not.toContain(':root{');
});

it.each(['red;}', '{', '<style>', 'a;b'])('rejects %s', (bad) => {
  expect(() => defineTheme({ shared: { radius: { control: bad } } })).toThrow(
    /radius\.control/,
  );
});

it('validates full themes too', () => {
  expect(() =>
    defineFullTheme({
      light: { ...softLight, radius: { ...softLight.radius, md: '}' } },
      dark: softDark,
    }),
  ).toThrow();
});

it('stays serializable', () => {
  const theme = defineTheme({ light: accent });
  expect(JSON.parse(JSON.stringify(theme))).toEqual(theme);
});
