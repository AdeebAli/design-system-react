import { resetWarnings, warnOnce } from './warn';

afterEach(() => vi.restoreAllMocks());

it('warns once per key', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  warnOnce('warn-test-a', 'first');
  warnOnce('warn-test-a', 'first');
  warnOnce('warn-test-b', 'second');
  expect(warn).toHaveBeenCalledTimes(2);
});

it('is silent in production', () => {
  vi.stubEnv('NODE_ENV', 'production');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  warnOnce('warn-test-prod', 'nope');
  expect(warn).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});

it('warns again after resetWarnings', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  warnOnce('warn-test-reset', 'first');
  resetWarnings();
  warnOnce('warn-test-reset', 'first');
  expect(warn).toHaveBeenCalledTimes(2);
});

// These two run in order on purpose: the second checks that the unit setup's
// afterEach(resetWarnings) ran after the first.
describe('the setup resets warnings after each test', () => {
  it('a key warns in one test', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnOnce('warn-test-setup', 'first');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('and warns again in the next', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnOnce('warn-test-setup', 'first');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
