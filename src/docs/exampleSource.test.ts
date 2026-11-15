import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exampleSource } from './exampleSource';

const here = dirname(fileURLToPath(import.meta.url));
const guide = join(here, 'guides/Themes.mdx');

type Hook = (this: unknown, ...args: unknown[]) => unknown;
const plugin = exampleSource();
const resolveId = (source: string, importer: string) =>
  (plugin.resolveId as Hook).call({}, source, importer, {});
const load = (id: string) => (plugin.load as Hook).call({}, id);

it('serves a .css.ts example as text', () => {
  const id = resolveId('../examples/themes/oneOff.css.ts?source', guide);
  expect(typeof id).toBe('string');
  expect(load(id as string)).toContain('export const promo');
});

it('refuses a file outside src/docs/examples', () => {
  expect(resolveId('../../styles/focus.css.ts?source', guide)).toBeNull();
});

it('refuses a file that is not .css.ts', () => {
  expect(resolveId('../examples/themes/App.tsx?source', guide)).toBeNull();
});

it('refuses to load a crafted id outside src/docs/examples', () => {
  const outside = resolve(here, '../styles/focus.css.ts');
  expect(load(`\0example-source:${outside}:text`)).toBeNull();
});

it('ignores other imports', () => {
  // Same length as ?source, so only the suffix check refuses it.
  expect(
    resolveId('../examples/themes/oneOff.css.ts?inline', guide),
  ).toBeNull();
});
