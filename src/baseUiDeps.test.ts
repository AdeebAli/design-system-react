import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseUiEntryPoints } from '../baseUiEntryPoints';

/**
 * A Base UI entry point Vite hasn't pre-bundled is found mid-run with an
 * empty cache, as in CI, and the reload fails that run's tests. vite.config.ts
 * derives the list from the source, so a new import can't be missed. The
 * config is read as text: importing it loads plugins that can't run under jsdom.
 */
it('pre-bundles every Base UI entry point the source mentions', () => {
  // Broader than the helper's pattern: any mention, including `import()` and
  // `export … from`, so a form the helper misses fails here.
  const mentioned = new Set<string>();
  const files = readdirSync('src', { recursive: true, encoding: 'utf8' });
  for (const file of files) {
    if (!/\.tsx?$/.test(file) || file.endsWith('baseUiDeps.test.ts')) continue;
    const source = readFileSync(join('src', file), 'utf8');
    for (const match of source.matchAll(/['"](@base-ui\/react\/[\w-]+)['"]/g)) {
      mentioned.add(match[1]!);
    }
  }
  const derived = baseUiEntryPoints('src');
  expect(mentioned.size).toBeGreaterThan(10);
  expect([...mentioned].filter((name) => !derived.includes(name))).toEqual([]);
});

it('vite.config.ts takes the list from the helper, with no hand-written entries', () => {
  const config = readFileSync('vite.config.ts', 'utf8');
  const list = /optimizeDeps:\s*{\s*include:\s*\[([^\]]*)\]/.exec(config)![1]!;
  expect(list).toContain('...baseUiEntryPoints(');
  expect(list).not.toMatch(/'@base-ui\/react\//);
});
