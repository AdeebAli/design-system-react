import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

// Guides show `.css.ts` examples as text. vanilla-extract compiles any id
// whose path ends in `.css.ts`, `?raw` included, so `?source` serves the
// file's text under an id that doesn't (Spec 18, Guides).
const SOURCE_PREFIX = '\0example-source:';

// Only example stylesheets, so a crafted dev-server request for the virtual
// id can't read any other file.
const EXAMPLES = resolve(dirname(fileURLToPath(import.meta.url)), 'examples');
const isExample = (file: string) =>
  file.startsWith(EXAMPLES + sep) && file.endsWith('.css.ts');

/** A Storybook-only Vite plugin: `import text from './x.css.ts?source'`. */
export function exampleSource(): Plugin {
  return {
    name: 'example-source',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('?source') || !importer) return null;
      const file = resolve(
        dirname(importer),
        source.slice(0, -'?source'.length),
      );
      return isExample(file) ? `${SOURCE_PREFIX}${file}:text` : null;
    },
    load(id) {
      if (!id.startsWith(SOURCE_PREFIX)) return null;
      const file = id.slice(SOURCE_PREFIX.length, -':text'.length);
      if (!isExample(resolve(file))) return null;
      return `export default ${JSON.stringify(readFileSync(file, 'utf8'))};`;
    },
  };
}
