import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Tooltip } from '../Tooltip';
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

it('forwards ref, style, data-*, and onClick to the button', async () => {
  const ref = createRef<HTMLButtonElement>();
  const onClick = vi.fn();
  render(
    <ThemeProvider>
      <ColorModeToggle
        ref={ref}
        style={{ opacity: 0.5 }}
        data-testid="toggle"
        onClick={onClick}
      />
    </ThemeProvider>,
  );
  const button = screen.getByTestId('toggle');
  expect(ref.current).toBe(button);
  expect(button).toHaveStyle({ opacity: '0.5' });
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('ds-color-mode')).toBe('dark');
});

it('does not flip when the consumer onClick prevents default', async () => {
  render(
    <ThemeProvider>
      <ColorModeToggle onClick={(event) => event.preventDefault()} />
    </ThemeProvider>,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(localStorage.getItem('ds-color-mode')).toBeNull();
  expect(root.getAttribute('data-ds-mode')).toBeNull();
});

it('works as a Tooltip child: hover shows the tooltip, click toggles the mode', async () => {
  render(
    <ThemeProvider>
      <Tooltip content="Hint" delay={0}>
        <ColorModeToggle />
      </Tooltip>
    </ThemeProvider>,
  );
  const button = screen.getByRole('button', { name: 'Switch to dark mode' });
  await userEvent.hover(button);
  expect(await screen.findByText('Hint')).toBeInTheDocument();
  await userEvent.click(button);
  expect(localStorage.getItem('ds-color-mode')).toBe('dark');
});

it('a forced ThemeProvider inside a Tooltip renders nothing and does not throw', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warns = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { container } = render(
    <ThemeProvider forcedMode="dark">
      <Tooltip content="Hint" delay={0}>
        <ColorModeToggle />
      </Tooltip>
    </ThemeProvider>,
  );
  expect(screen.queryByRole('button')).toBeNull();
  await userEvent.hover(container);
  await userEvent.tab();
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByText('Hint')).toBeNull();
  expect(errors).not.toHaveBeenCalled();
  expect(warns).not.toHaveBeenCalled();
  errors.mockRestore();
  warns.mockRestore();
});

it('keeps its own name, icon, and element when a caller bypasses the types', () => {
  render(
    <ThemeProvider>
      <ColorModeToggle
        {...({ 'aria-label': 'x', as: 'a', icon: 'nope' } as object)}
      />
    </ThemeProvider>,
  );
  const button = screen.getByRole('button', { name: 'Switch to dark mode' });
  expect(button.tagName).toBe('BUTTON');
  expect(button.querySelector('svg')).not.toBeNull();
});
