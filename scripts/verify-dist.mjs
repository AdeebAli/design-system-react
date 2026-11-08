// Asserts the published shape from Spec 01. Exits non-zero on any failure.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const dist = 'dist';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync(dist)) {
  console.error('dist/ is missing');
  process.exit(1);
}

const files = walk(dist);

if (!existsSync(join(dist, 'index.js')))
  failures.push('dist/index.js is missing');

const css = files.filter((file) => file.endsWith('.css'));
if (css.length !== 1 || css[0] !== join(dist, 'styles.css')) {
  failures.push(`expected only dist/styles.css, found: ${css.join(', ')}`);
}

const declarations = files.filter((file) => file.endsWith('.d.ts'));
if (declarations.length !== 1 || declarations[0] !== join(dist, 'index.d.ts')) {
  failures.push(
    `expected only dist/index.d.ts, found: ${declarations.join(', ')}`,
  );
} else {
  const types = readFileSync(declarations[0], 'utf8');
  if (/from\s+['"]\.\.?\//.test(types))
    failures.push('index.d.ts has relative imports');
  if (types.includes('base-ui')) failures.push('index.d.ts mentions base-ui');
  if (/lucide/i.test(types)) failures.push('index.d.ts mentions Lucide');
}

const boxModule = join(dist, 'components/Box/Box.js');
if (!existsSync(boxModule)) {
  failures.push('modules are not preserved: components/Box/Box.js is missing');
}

for (const file of files.filter((name) => name.endsWith('.js'))) {
  const source = readFileSync(file, 'utf8');
  if (
    source.includes('Symbol.for("react.') ||
    source.includes('react.transitional.element')
  ) {
    failures.push(`${file} appears to inline React`);
  }
}

const clientModules = [
  'theme/ThemeProvider.js',
  'components/Button/ButtonBase.js',
  'components/Button/Button.js',
  'components/IconButton/IconButton.js',
];
for (const module of clientModules) {
  const path = join(dist, module);
  if (!existsSync(path)) {
    failures.push(`${path} is missing`);
  } else if (!/^\s*['"]use client['"]/.test(readFileSync(path, 'utf8'))) {
    failures.push(`${path} doesn't begin with "use client"`);
  }
}

// Server-safe components must not become client modules (Spec 08).
const serverModules = [
  'components/Card/Card.js',
  'components/Stat/Stat.js',
  'components/Badge/Badge.js',
];
for (const module of serverModules) {
  const path = join(dist, module);
  if (!existsSync(path)) {
    failures.push(`${path} is missing`);
  } else if (/^\s*['"]use client['"]/.test(readFileSync(path, 'utf8'))) {
    failures.push(`${path} begins with "use client"`);
  }
}

const stylesPath = join(dist, 'styles.css');
if (existsSync(stylesPath)) {
  const styles = readFileSync(stylesPath, 'utf8');
  if (
    !styles
      .trimStart()
      .startsWith('@layer ds.theme,ds.reset,ds.base,ds.components,ds.utilities')
  ) {
    failures.push('styles.css does not declare the layer order first');
  }
  if (!/url\(["']?\.\/fonts\//.test(styles)) {
    failures.push('styles.css has no relative font URLs');
  }
  if (styles.includes('googleapis')) {
    failures.push('styles.css requests fonts from another origin');
  }
  if (!/font-family:\s*["']?Inter Fallback/.test(styles)) {
    failures.push('styles.css has no metric-matched fallback faces');
  }
  if (styles.split('--ds-color-bg-canvas:#141311').length - 1 !== 2) {
    failures.push('Soft Dark variables should appear exactly twice');
  }
  if (!styles.includes('--ds-color-bg-canvas:#f4f2ee')) {
    failures.push('styles.css has no Soft Light variables');
  }
}
if (!existsSync(join(dist, 'licenses', 'LICENSE-lucide.txt'))) {
  failures.push('dist/licenses/LICENSE-lucide.txt is missing');
}
if (
  files.some(
    (file) =>
      file.endsWith('.js') &&
      /from ["']lucide/.test(readFileSync(file, 'utf8')),
  )
) {
  failures.push('dist imports lucide-react');
}

// Everything but font faces and keyframes must sit in a layer, so consumers'
// unlayered CSS and the layer order always decide (Spec 02, Spec 05).
// vanilla-extract can't layer keyframes, and their hashed names can't clash.
if (existsSync(stylesPath)) {
  const styles = readFileSync(stylesPath, 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  let depth = 0;
  let prelude = '';
  for (const char of styles) {
    if (char === '{') {
      if (depth === 0) {
        const name = prelude.trim();
        if (
          !name.startsWith('@layer') &&
          !name.startsWith('@font-face') &&
          !name.startsWith('@keyframes')
        ) {
          failures.push(
            `styles.css has an unlayered rule: ${name.slice(0, 60)}`,
          );
        }
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) prelude = '';
    } else if (depth === 0) {
      prelude = char === ';' ? '' : prelude + char;
    }
  }
}

for (const name of [
  'inter-latin-opsz-normal.woff2',
  'inter-extended-opsz-normal.woff2',
  'inter-latin-opsz-italic.woff2',
  'inter-extended-opsz-italic.woff2',
  'source-serif-4-latin-opsz-normal.woff2',
  'ibm-plex-mono-latin-400-normal.woff2',
  'LICENSE-inter.txt',
]) {
  if (!existsSync(join(dist, 'fonts', name))) {
    failures.push(`dist/fonts/${name} is missing`);
  }
}

if (failures.length > 0) {
  console.error(
    failures.map((failure) => `verify-dist: ${failure}`).join('\n'),
  );
  process.exit(1);
}
console.log('verify-dist: ok');
