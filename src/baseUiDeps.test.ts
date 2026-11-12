import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A Base UI entry point Vite hasn't pre-bundled is found mid-run with an
 * empty cache, as in CI, and the reload fails that run's tests. The config is
 * read as text: importing it loads plugins that can't run under jsdom.
 */
it('pre-bundles every Base UI entry point the source imports', () => {
  const imported = new Set<string>();
  const files = readdirSync('src', { recursive: true, encoding: 'utf8' });
  for (const file of files) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(join('src', file), 'utf8');
    for (const match of source.matchAll(/from '(@base-ui\/react\/[\w-]+)'/g)) {
      imported.add(match[1]!);
    }
  }
  const config = readFileSync('vite.config.ts', 'utf8');
  const list = /optimizeDeps:\s*{\s*include:\s*\[([^\]]*)\]/.exec(config)![1]!;
  const included = [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  expect(imported.size).toBeGreaterThan(10);
  expect([...imported].filter((name) => !included.includes(name))).toEqual([]);
});
