// Implements ADR 0003: npm run release -- <patch|minor|major>
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUMPS = ['patch', 'minor', 'major'];

export function parseBump(arg) {
  if (!BUMPS.includes(arg)) {
    throw new Error('Usage: npm run release -- <patch|minor|major>');
  }
  return arg;
}

export function preflightFailures({
  ghAuthed,
  branch,
  clean,
  ahead,
  behind,
  ciSucceeded,
}) {
  const failures = [];
  if (!ghAuthed) failures.push('gh is not installed or not authenticated.');
  if (branch !== 'main') failures.push(`Release from main, not ${branch}.`);
  if (!clean) failures.push('The working tree has uncommitted changes.');
  if (ahead !== 0 || behind !== 0) {
    failures.push(
      `The branch differs from origin/main: ${ahead} ahead, ${behind} behind.`,
    );
  }
  if (!ciSucceeded) failures.push('CI has not succeeded on HEAD.');
  return failures;
}

function output(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim();
}

function succeeds(command, args) {
  try {
    execFileSync(command, args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function readState() {
  const ghAuthed = succeeds('gh', ['auth', 'status']);
  execFileSync('git', ['fetch', 'origin', 'main'], { stdio: 'inherit' });
  const [behind = 0, ahead = 0] = output('git', [
    'rev-list',
    '--left-right',
    '--count',
    'origin/main...HEAD',
  ])
    .split(/\s+/)
    .map(Number);
  let ciSucceeded = false;
  if (ghAuthed) {
    const sha = output('git', ['rev-parse', 'HEAD']);
    const runs = JSON.parse(
      output('gh', [
        'run',
        'list',
        '--commit',
        sha,
        '--workflow',
        'ci.yml',
        '--json',
        'conclusion',
      ]),
    );
    ciSucceeded = runs.some((run) => run.conclusion === 'success');
  }
  return {
    ghAuthed,
    branch: output('git', ['branch', '--show-current']),
    clean: output('git', ['status', '--porcelain']) === '',
    ahead,
    behind,
    ciSucceeded,
  };
}

function main() {
  const bump = parseBump(process.argv[2]);
  const failures = preflightFailures(readState());
  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  execFileSync('npm', ['run', 'check'], { stdio: 'inherit' });
  execFileSync('npm', ['version', bump, '-m', 'v%s'], { stdio: 'inherit' });

  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const tag = `v${version}`;

  try {
    execFileSync('git', ['push', '--follow-tags'], { stdio: 'inherit' });
    execFileSync(
      'gh',
      ['release', 'create', tag, '--generate-notes', '--verify-tag'],
      { stdio: 'inherit' },
    );
  } catch {
    console.error(`
The release didn't finish. ${tag} exists locally. To finish:
  git push --follow-tags
  gh release create ${tag} --generate-notes --verify-tag
To undo, if nothing was pushed:
  git tag -d ${tag}
  git reset --hard HEAD~1`);
    process.exit(1);
  }

  const repo = output('gh', ['repo', 'view', '--json', 'url', '--jq', '.url']);
  console.log(`Release: ${repo}/releases/tag/${tag}`);
  console.log(`Publish run: ${repo}/actions/workflows/publish.yml`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
