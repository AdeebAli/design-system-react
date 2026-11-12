// Implements ADR 0003: npm run release -- <patch|minor|major> [--notes-file <path>]
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUMPS = ['patch', 'minor', 'major'];
const USAGE =
  'Usage: npm run release -- <patch|minor|major> [--notes-file <path>]';

export function parseBump(arg) {
  if (!BUMPS.includes(arg)) throw new Error(USAGE);
  return arg;
}

export function parseArgs([bump, ...rest]) {
  let notesFile;
  if (rest.length > 0) {
    if (rest.length !== 2 || rest[0] !== '--notes-file' || !rest[1]) {
      throw new Error(USAGE);
    }
    notesFile = rest[1];
  }
  return { bump: parseBump(bump), notesFile };
}

// Without a notes file, GitHub generates notes that list only the merged PRs.
export function releaseCreateArgs(tag, notesFile) {
  const notes = notesFile ? ['--notes-file', notesFile] : ['--generate-notes'];
  return ['release', 'create', tag, ...notes, '--verify-tag'];
}

// End-of-life dates of Node's LTS lines, from https://nodejs.org/en/about/previous-releases.
// Add new lines as they reach LTS.
const NODE_END_OF_LIFE = {
  20: '2026-04-30',
  22: '2027-04-30',
  24: '2028-04-30',
  26: '2029-04-30',
};

export function preflightFailures({
  ghAuthed,
  branch,
  clean,
  ahead,
  behind,
  ciSucceeded,
  enginesNode,
  today,
  notesFile,
  notesFileFound,
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
  if (notesFile && !notesFileFound) {
    failures.push(`The notes file ${notesFile} doesn't exist or is empty.`);
  }
  // engines.node applies to consumers, so it shouldn't name a line that's no
  // longer supported (Spec 01).
  const floor = /^>=\s*(\d+)/.exec(enginesNode ?? '')?.[1];
  const endOfLife = floor && NODE_END_OF_LIFE[floor];
  if (endOfLife && today > endOfLife) {
    failures.push(
      `engines.node is ${enginesNode}, but Node ${floor} reached end of life on ${endOfLife}. Raise it to the oldest supported Node line, and update the package job's matrix in ci.yml.`,
    );
  }
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

function hasContent(path) {
  try {
    return statSync(path).size > 0;
  } catch {
    return false;
  }
}

function readState(notesFile) {
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
    enginesNode: JSON.parse(readFileSync('package.json', 'utf8')).engines?.node,
    today: new Date().toISOString().slice(0, 10),
    notesFile,
    notesFileFound: notesFile ? hasContent(notesFile) : undefined,
  };
}

function main() {
  const { bump, notesFile } = parseArgs(process.argv.slice(2));
  const failures = preflightFailures(readState(notesFile));
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
    execFileSync('gh', releaseCreateArgs(tag, notesFile), {
      stdio: 'inherit',
    });
  } catch {
    console.error(`
The release didn't finish. ${tag} exists locally. To finish:
  git push --follow-tags
  gh ${releaseCreateArgs(tag, notesFile).join(' ')}
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
