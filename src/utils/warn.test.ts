import { warnOnce } from './warn';

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
