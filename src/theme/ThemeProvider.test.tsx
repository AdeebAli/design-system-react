import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { defineTheme } from './defineTheme';
import { ThemeProvider, useColorMode } from './ThemeProvider';

const root = document.documentElement;

const probeRendered = vi.fn();

function Probe() {
  const { mode, resolvedMode, setMode, isForced } = useColorMode();
  probeRendered();
  return (
    <div>
      <output data-testid="mode">{mode}</output>
      <output data-testid="resolved">resolved:{String(resolvedMode)}</output>
      <output data-testid="forced">{String(isForced)}</output>
      <button onClick={() => setMode('dark')}>dark</button>
      <button onClick={() => setMode('light')}>light</button>
      <button onClick={() => setMode('system')}>system</button>
    </div>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;

beforeEach(() => {
  localStorage.clear();
  root.removeAttribute('data-ds-mode');
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('sets data-ds-mode for light and dark, and removes it for system', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(root.hasAttribute('data-ds-mode')).toBe(false);
  act(() => screen.getByText('dark').click());
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
  act(() => screen.getByText('light').click());
  expect(root.getAttribute('data-ds-mode')).toBe('light');
  act(() => screen.getByText('system').click());
  expect(root.hasAttribute('data-ds-mode')).toBe(false);
});

it('stores system even when defaultMode is dark', () => {
  render(
    <ThemeProvider defaultMode="dark">
      <Probe />
    </ThemeProvider>,
  );
  expect(text('mode')).toBe('dark');
  act(() => screen.getByText('system').click());
  expect(localStorage.getItem('ds-color-mode')).toBe('system');
  expect(text('mode')).toBe('system');
  expect(root.hasAttribute('data-ds-mode')).toBe(false);
});

it('uses a custom storageKey', () => {
  render(
    <ThemeProvider storageKey="custom">
      <Probe />
    </ThemeProvider>,
  );
  act(() => screen.getByText('dark').click());
  expect(localStorage.getItem('custom')).toBe('dark');
});

it('restores the previous data-ds-mode on unmount', () => {
  root.setAttribute('data-ds-mode', 'light');
  const { unmount } = render(<ThemeProvider forcedMode="dark" />);
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
  unmount();
  expect(root.getAttribute('data-ds-mode')).toBe('light');
});

it('keeps the right mode, with no warning, in StrictMode', () => {
  const warn = vi.spyOn(console, 'warn');
  render(
    <StrictMode>
      <ThemeProvider defaultMode="dark" />
    </StrictMode>,
  );
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
  expect(warn).not.toHaveBeenCalled();
});

it('warns for a nested provider, and the inner one does nothing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <ThemeProvider defaultMode="light">
      <ThemeProvider forcedMode="dark">
        <Probe />
      </ThemeProvider>
    </ThemeProvider>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(root.getAttribute('data-ds-mode')).toBe('light');
  expect(text('forced')).toBe('false');
});

it('falls back to defaultMode for an invalid stored value', () => {
  localStorage.setItem('ds-color-mode', 'purple');
  render(
    <ThemeProvider defaultMode="dark">
      <Probe />
    </ThemeProvider>,
  );
  expect(text('mode')).toBe('dark');
});

it('works when localStorage throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  act(() => screen.getByText('dark').click());
  expect(text('mode')).toBe('dark');
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
});

it('updates from a storage event', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  act(() => {
    localStorage.setItem('ds-color-mode', 'dark');
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'ds-color-mode', newValue: 'dark' }),
    );
  });
  expect(text('mode')).toBe('dark');
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
});

it('warns and does nothing on setMode when forced, and leaves the stored choice', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  localStorage.setItem('ds-color-mode', 'light');
  render(
    <ThemeProvider forcedMode="dark">
      <Probe />
    </ThemeProvider>,
  );
  expect(text('forced')).toBe('true');
  act(() => screen.getByText('system').click());
  expect(warn).toHaveBeenCalled();
  expect(localStorage.getItem('ds-color-mode')).toBe('light');
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
});

it('resolves the OS setting in system mode', () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(text('resolved')).toBe('resolved:dark');
});

it('has resolvedMode undefined during server rendering', () => {
  const html = renderToString(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(html).toContain('undefined');
  expect(html).not.toContain('resolved:<!-- -->light');
});

it('throws a clear error outside a provider', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
});

it('renders overrides in a plain style element, unescaped, with the nonce', () => {
  const html = renderToString(
    <ThemeProvider
      nonce="n"
      theme={defineTheme({
        shared: { font: { family: { sans: '"My Font", sans-serif' } } },
      })}
    />,
  );
  expect(html).toContain('"My Font"');
  expect(html).toContain('nonce="n"');
  expect(html).not.toContain('precedence');
});

it('renders no element without a theme', () => {
  expect(renderToString(<ThemeProvider />)).toBe('');
});

it('re-renders only components calling the hook when the mode changes', () => {
  const plainRendered = vi.fn();
  function Plain() {
    plainRendered();
    return null;
  }
  render(
    <ThemeProvider>
      <Plain />
      <Probe />
    </ThemeProvider>,
  );
  const before = plainRendered.mock.calls.length;
  const probeBefore = probeRendered.mock.calls.length;
  act(() => screen.getByText('dark').click());
  expect(plainRendered.mock.calls.length).toBe(before);
  expect(probeRendered.mock.calls.length).toBeGreaterThan(probeBefore);
});
