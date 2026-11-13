import { warnOnce } from './warn';

afterEach(() => vi.restoreAllMocks());

// These two run in order on purpose: the second checks that the browser
// setup's afterEach(resetWarnings) ran after the first.
describe('the browser setup resets warnings after each test', () => {
  it('a key warns in one test', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnOnce('warn-browser-setup', 'first');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('and warns again in the next', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnOnce('warn-browser-setup', 'first');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
