import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ColorModeToggle } from './index';

const root = document.documentElement;

function stubOs(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  localStorage.clear();
  root.removeAttribute('data-ds-mode');
  stubOs(false);
});

afterEach(() => vi.unstubAllGlobals());

it('in light, offers dark, and clicking stores dark', async () => {
  render(
    <ThemeProvider>
      <ColorModeToggle />
    </ThemeProvider>,
  );
  const button = screen.getByRole('button', { name: 'Switch to dark mode' });
  expect(button.querySelector('svg')).not.toBeNull();
  await userEvent.click(button);
  expect(localStorage.getItem('ds-color-mode')).toBe('dark');
  expect(root.getAttribute('data-ds-mode')).toBe('dark');
  expect(
    screen.getByRole('button', { name: 'Switch to light mode' }),
  ).toBeInTheDocument();
});

it('in a dark OS, clicking stores light', async () => {
  stubOs(true);
  render(
    <ThemeProvider>
      <ColorModeToggle />
    </ThemeProvider>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Switch to light mode' }),
  );
  expect(localStorage.getItem('ds-color-mode')).toBe('light');
});

it('renders nothing when the mode is forced', () => {
  const { container } = render(
    <ThemeProvider forcedMode="dark">
      <ColorModeToggle />
    </ThemeProvider>,
  );
  expect(container).toBeEmptyDOMElement();
});

it('labels replace the names', () => {
  render(
    <ThemeProvider>
      <ColorModeToggle
        labels={{
          toDark: 'Mode sombre',
          toLight: 'Mode clair',
          neutral: 'Changer',
        }}
      />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole('button', { name: 'Mode sombre' }),
  ).toBeInTheDocument();
});

it('server-renders a neutral, icon-less button that hydrates without a mismatch', () => {
  const tree = (
    <ThemeProvider>
      <ColorModeToggle />
    </ThemeProvider>
  );
  const html = renderToString(tree);
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const button = container.querySelector('button')!;
  expect(button).toHaveAttribute('aria-label', 'Switch color mode');
  expect(button.querySelector('svg')).toBeNull();
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const onRecoverableError = vi.fn();
  act(() => {
    hydrateRoot(container, tree, { onRecoverableError });
  });
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
  expect(container.querySelector('button')).toHaveAttribute(
    'aria-label',
    'Switch to dark mode',
  );
  errors.mockRestore();
  container.remove();
});
