import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every Base UI entry point the source imports, such as
 * `@base-ui/react/accordion`, for Vite's `optimizeDeps.include`. Derived, so a
 * new import is pre-bundled without anyone remembering to list it.
 */
export function baseUiEntryPoints(src: string): string[] {
  const found = new Set<string>();
  for (const file of readdirSync(src, { recursive: true, encoding: 'utf8' })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(join(src, file), 'utf8');
    for (const match of source.matchAll(/from '(@base-ui\/react\/[\w-]+)'/g)) {
      found.add(match[1]!);
    }
  }
  return [...found].sort();
}
