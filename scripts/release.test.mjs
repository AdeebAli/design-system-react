import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  hasContent,
  parseArgs,
  shellCommand,
  parseBump,
  preflightFailures,
  releaseCreateArgs,
} from './release.mjs';

const ready = {
  ghAuthed: true,
  branch: 'main',
  clean: true,
  ahead: 0,
  behind: 0,
  ciSucceeded: true,
};

test('parseBump accepts only patch, minor, and major', () => {
  assert.equal(parseBump('minor'), 'minor');
  assert.equal(parseBump('patch'), 'patch');
  assert.equal(parseBump('major'), 'major');
  assert.throws(() => parseBump('huge'));
  assert.throws(() => parseBump(undefined));
});

test('preflight passes when everything is ready', () => {
  assert.deepEqual(preflightFailures(ready), []);
});

test('preflight requires main', () => {
  assert.match(preflightFailures({ ...ready, branch: 'dev' })[0], /main/);
});

test('preflight reports every failure', () => {
  assert.equal(
    preflightFailures({
      ghAuthed: false,
      branch: 'dev',
      clean: false,
      ahead: 1,
      behind: 1,
      ciSucceeded: false,
    }).length,
    5,
  );
});

test('preflight rejects a branch that is behind', () => {
  assert.match(preflightFailures({ ...ready, behind: 2 })[0], /origin\/main/);
});

test('preflight refuses a Node floor past its end of life', () => {
  const failures = preflightFailures({
    ...ready,
    enginesNode: '>=22',
    today: '2027-05-01',
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /Node 22 reached end of life on 2027-04-30/);
});

test('preflight accepts a Node floor before its end of life', () => {
  assert.deepEqual(
    preflightFailures({ ...ready, enginesNode: '>=22', today: '2027-04-30' }),
    [],
  );
});

test('parseArgs reads the bump alone', () => {
  assert.deepEqual(parseArgs(['minor']), {
    bump: 'minor',
    notesFile: undefined,
  });
});

test('parseArgs reads --notes-file after the bump', () => {
  assert.deepEqual(parseArgs(['minor', '--notes-file', '/tmp/notes.md']), {
    bump: 'minor',
    notesFile: '/tmp/notes.md',
  });
});

test('parseArgs rejects --notes-file without a path', () => {
  assert.throws(() => parseArgs(['minor', '--notes-file']), /Usage/);
});

test('parseArgs rejects --notes-file with an empty path', () => {
  assert.throws(() => parseArgs(['minor', '--notes-file', '']), /Usage/);
});

test('parseArgs rejects an unknown option', () => {
  assert.throws(() => parseArgs(['minor', '--draft', 'yes']), /Usage/);
});

test('parseArgs rejects extra arguments', () => {
  assert.throws(
    () => parseArgs(['minor', '--notes-file', 'notes.md', 'extra']),
    /Usage/,
  );
});

test('preflight refuses a notes file that is missing or empty', () => {
  const failures = preflightFailures({
    ...ready,
    notesFile: 'notes.md',
    notesFileFound: false,
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /notes\.md/);
});

test('preflight accepts a notes file that has content', () => {
  assert.deepEqual(
    preflightFailures({
      ...ready,
      notesFile: 'notes.md',
      notesFileFound: true,
    }),
    [],
  );
});

test('the release uses generated notes without a notes file', () => {
  assert.deepEqual(releaseCreateArgs('v1.0.0', undefined), [
    'release',
    'create',
    'v1.0.0',
    '--generate-notes',
    '--verify-tag',
  ]);
});

test('the release uses the notes file instead of generated notes', () => {
  assert.deepEqual(releaseCreateArgs('v1.0.0', '/tmp/notes.md'), [
    'release',
    'create',
    'v1.0.0',
    '--notes-file',
    '/tmp/notes.md',
    '--verify-tag',
  ]);
});

test('a notes file needs non-blank text and must be a file, not a folder', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'release-notes-'));
  t.after(() => rmSync(dir, { recursive: true }));
  const notes = join(dir, 'notes.md');
  const blank = join(dir, 'blank.md');
  writeFileSync(notes, '# Notes\n');
  writeFileSync(blank, '  \n\t\n');
  assert.equal(hasContent(notes), true);
  assert.equal(hasContent(blank), false);
  assert.equal(hasContent(dir), false);
  assert.equal(hasContent(join(dir, 'missing.md')), false);
});

test('a printed command quotes arguments the shell would split', () => {
  assert.equal(
    shellCommand(['--notes-file', "/Users/me/My Notes/it's.md"]),
    `--notes-file '/Users/me/My Notes/it'\\''s.md'`,
  );
  assert.equal(shellCommand(['=notes.md']), `'=notes.md'`);
});

test('a printed command leaves plain arguments bare', () => {
  assert.equal(
    shellCommand(['gh', 'release', 'create', 'v1.0.0', '-F', '/tmp/n.md']),
    'gh release create v1.0.0 -F /tmp/n.md',
  );
});
