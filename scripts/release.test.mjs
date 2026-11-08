import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBump, preflightFailures } from './release.mjs';

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
