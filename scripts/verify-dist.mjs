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

const clientModules = ['utils/clientProbe.js'];
for (const module of clientModules) {
  const path = join(dist, module);
  if (!existsSync(path)) {
    failures.push(`${path} is missing`);
  } else if (!/^\s*['"]use client['"]/.test(readFileSync(path, 'utf8'))) {
    failures.push(`${path} doesn't begin with "use client"`);
  }
}

if (failures.length > 0) {
  console.error(
    failures.map((failure) => `verify-dist: ${failure}`).join('\n'),
  );
  process.exit(1);
}
console.log('verify-dist: ok');
