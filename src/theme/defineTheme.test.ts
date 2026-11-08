import { softDark } from '../themes/softDark';
import { softLight } from '../themes/softLight';
import { defineFullTheme, defineTheme, type Theme } from './defineTheme';
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

it.each(['"Inter', "Inter'", 'a/*b', 'a\\', '"a" "b'])(
  'rejects %s, which would break the rules after it',
  (bad) => {
    expect(() =>
      defineTheme({ shared: { font: { family: { sans: bad } } } }),
    ).toThrow(/Invalid theme value/);
  },
);

it('accepts quoted font names', () => {
  expect(() =>
    defineTheme({
      shared: {
        font: { family: { sans: '"Inter Var", \'Helvetica\', sans-serif' } },
      },
    }),
  ).not.toThrow();
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

const reducedMotion =
  '@media (prefers-reduced-motion: reduce){:root:not([data-ds-mode]),:root[data-ds-mode]{--ds-motion-duration-fast:0ms;--ds-motion-duration-base:0ms;--ds-motion-duration-slow:0ms}}';

it.each([
  [
    'shared',
    defineTheme({ shared: { motion: { duration: { base: '250ms' } } } }),
  ],
  ['dark', defineTheme({ dark: { motion: { duration: { fast: '90ms' } } } })],
  ['full', defineFullTheme({ light: softLight, dark: softDark })],
])('keeps reduced motion last when a %s theme sets durations', (_, theme) => {
  expect(themeToCss(theme).endsWith(reducedMotion)).toBe(true);
});

it('adds no reduced motion rule when durations are untouched', () => {
  expect(themeToCss(defineTheme({ light: accent }))).not.toContain(
    'prefers-reduced-motion',
  );
});

it.each([
  ['a value', { shared: { color: { bg: { accent: '</style><script>' } } } }],
  ['a key', { shared: { 'a{b': 'red' } }],
])('validates %s even without defineTheme', (_, theme) => {
  expect(() => themeToCss(theme as Theme)).toThrow(/Invalid theme/);
});

it('skips undefined and null values', () => {
  const missing: string | undefined = undefined;
  const css = themeToCss(
    defineTheme({
      shared: { radius: { control: missing, sm: '4px' } },
      dark: { color: { fg: { default: null as unknown as string } } },
    }),
  );
  expect(css).toBe(':root{--ds-radius-sm:4px}');
});
