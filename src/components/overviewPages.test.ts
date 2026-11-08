import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Spec 08 and 09: these pages must be buildable without escape hatches.
it.each([['Bento.stories.tsx']])(
  '%s uses no style or className',
  (file: string) => {
    const source = readFileSync(join(here, file), 'utf8');
    expect(source).not.toMatch(/\bstyle=|\bclassName=/);
  },
);
