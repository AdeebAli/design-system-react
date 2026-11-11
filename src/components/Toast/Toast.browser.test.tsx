import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { cdp, userEvent } from 'vitest/browser';
import { ToastProvider, createToastManager } from './index';

it('a toast has the popup surface: background, border, shadow, radius', async () => {
  const manager = createToastManager();
  render(<ToastProvider manager={manager} />);
  act(() => {
    manager.add({ title: 'Surface', duration: 0 });
  });
  const root = (await screen.findByText('Surface')).closest('[data-tone]')!;
  const style = getComputedStyle(root);
  expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(style.boxShadow).not.toBe('none');
  expect(style.borderTopWidth).toBe('1px');
  expect(style.borderTopLeftRadius).not.toBe('0px');
});

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
function setup(props: Parameters<typeof ToastProvider>[0] = {}) {
  const manager = createToastManager();
  render(<ToastProvider manager={manager} {...props} />);
  return manager;
}

it('a neutral toast is announced politely and a danger toast through role="alert"', async () => {
  const manager = setup({ duration: 0 });
  act(() => {
    manager.add({ title: 'Quiet news' });
  });
  await screen.findByText('Quiet news');
  expect(screen.queryByRole('alert')).toBeNull();
  const polite = document.querySelector('[aria-live="polite"]');
  expect(polite).not.toBeNull();
  await expect.poll(() => polite!.textContent).toContain('Quiet news');

  act(() => {
    manager.add({ title: 'Loud news', tone: 'danger' });
  });
  const alert = await screen.findByRole('alert');
  await expect.poll(() => alert.textContent).toContain('Loud news');
});

it('a failed promise is announced through role="alert"', async () => {
  const manager = setup();
  const failing = Promise.reject(new Error('down'));
  act(() => {
    manager
      .promise(failing, {
        loading: 'Saving',
        success: 'Saved',
        error: (e) => ({ title: 'Could not save', description: String(e) }),
      })
      .catch(() => undefined);
  });
  const alert = await screen.findByRole('alert');
  await expect.poll(() => alert.textContent).toContain('Could not save');
});

it('the timer pauses on hover, then the toast closes', async () => {
  const manager = setup({ duration: 600 });
  act(() => {
    manager.add({ title: 'Hovered' });
  });
  const title = await screen.findByText('Hovered');
  await userEvent.hover(title);
  await pause(1200);
  expect(screen.getByText('Hovered')).toBeInTheDocument();
  await userEvent.unhover(title);
  await expect
    .poll(() => screen.queryByText('Hovered'), { timeout: 4000 })
    .toBeNull();
});

it('action and danger toasts stay, and time out when given a duration', async () => {
  const manager = setup({ duration: 300 });
  act(() => {
    manager.add({
      title: 'Has action',
      action: { label: 'Undo', onClick: vi.fn() },
    });
    manager.add({ title: 'Danger stays', tone: 'danger' });
    manager.add({ title: 'Danger times out', tone: 'danger', duration: 300 });
    manager.add({ title: 'Pinned', duration: 0 });
    manager.add({ title: 'Ordinary' });
  });
  await screen.findByText('Ordinary');
  await expect.poll(() => screen.queryByText('Ordinary')).toBeNull();
  await expect
    .poll(() => screen.queryAllByText('Danger times out'))
    .toHaveLength(0);
  await pause(500);
  expect(screen.getByText('Has action')).toBeInTheDocument();
  expect(screen.getAllByText('Danger stays').length).toBeGreaterThan(0);
  expect(screen.getByText('Pinned')).toBeInTheDocument();
});

it('limit caps how many toasts show', async () => {
  const manager = setup({ limit: 2, duration: 0 });
  act(() => {
    for (const n of ['One', 'Two', 'Three']) manager.add({ title: n });
  });
  await screen.findByText('Three');
  await expect
    .poll(
      () =>
        screen
          .getByRole('region')
          .querySelectorAll('[data-tone]:not([data-limited])').length,
    )
    .toBe(2);
});

it('F6 moves focus to the toasts', async () => {
  const manager = setup({ duration: 0 });
  act(() => {
    manager.add({ title: 'Focus me' });
  });
  await screen.findByText('Focus me');
  await userEvent.keyboard('{F6}');
  await expect
    .poll(() => screen.getByRole('region').contains(document.activeElement))
    .toBe(true);
});

it('under reduced motion transitions are 0s and a toast still closes', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  try {
    const manager = setup({ duration: 0 });
    act(() => {
      manager.add({ title: 'Calm' });
    });
    const root = (await screen.findByText('Calm')).closest('[data-tone]')!;
    expect(getComputedStyle(root).transitionDuration).toBe('0s');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await expect.poll(() => screen.queryByText('Calm')).toBeNull();
  } finally {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: '' }],
    });
  }
});

describe('swipe to dismiss follows text direction', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  // A real pointer drag through CDP, from the toast's text by `dx` pixels.
  async function drag(title: string, dx: number) {
    const rect = (await screen.findByText(title)).getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const x = rect.left + 20;
    const send = (type: string, at: number, extra = {}) =>
      cdp().send('Input.dispatchMouseEvent', {
        type,
        x: at,
        y,
        button: 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1,
        ...extra,
      });
    await send('mouseMoved', x, { button: 'none', buttons: 0 });
    await send('mousePressed', x);
    for (let i = 1; i <= 10; i++) await send('mouseMoved', x + (dx * i) / 10);
    await send('mouseReleased', x + dx);
  }

  it.each([
    ['rtl', 'left', -120, 120],
    ['ltr', 'right', 120, -120],
  ] as const)(
    'in %s a bottom-end toast is swiped away toward the %s edge only',
    async (dir, _edge, toward, away) => {
      document.documentElement.dir = dir;
      const manager = setup({ duration: 0, position: 'bottom-end' });
      act(() => {
        manager.add({ title: 'Swipe me' });
      });
      await drag('Swipe me', away);
      await pause(600);
      expect(screen.queryByText('Swipe me')).toBeInTheDocument();
      await drag('Swipe me', toward);
      await expect
        .poll(() => screen.queryByText('Swipe me'), { timeout: 3000 })
        .not.toBeInTheDocument();
    },
  );
});
