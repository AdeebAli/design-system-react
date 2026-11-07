// Verifies the packed tarball in real consumer apps (Spec 01).
import { execFileSync } from 'node:child_process';
import { globSync, readFileSync, rmSync } from 'node:fs';

const fixtures = ['fixtures/vite-app', 'fixtures/next-app'];

function run(command, args, cwd = '.') {
  console.log(`\n> (${cwd}) ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

for (const old of globSync('*.tgz')) rmSync(old);

run('npm', ['run', 'build']);
run('npm', ['pack', '--silent']);

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const tarball = `adeebali-design-system-react-${version}.tgz`;

run('npx', ['publint', tarball]);
// styles.css is a stylesheet, so it has no type declarations to resolve.
run('npx', [
  'attw',
  tarball,
  '--profile',
  'esm-only',
  '--exclude-entrypoints',
  './styles.css',
]);

for (const fixture of fixtures) {
  run(
    'npm',
    ['install', '--no-audit', '--no-fund', '--no-package-lock'],
    fixture,
  );
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
      '--no-save',
      `../../${tarball}`,
    ],
    fixture,
  );
  // Next generates the types its typecheck needs during the build.
  run('npm', ['run', 'build'], fixture);
  run('npm', ['run', 'typecheck'], fixture);
}

run('npx', [
  'playwright',
  'test',
  '--config',
  'tests/fixtures/playwright.config.ts',
]);
