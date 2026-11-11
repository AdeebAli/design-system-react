import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, createToastManager, useToast } from './index';
import type { ToastManager } from './index';

const held: { toast?: ToastManager } = {};
function Grab({ onToast }: { onToast?: (m: ToastManager) => void }) {
  const manager = useToast();
  useEffect(() => onToast?.(manager), [manager, onToast]);
  return null;
}
const grab = (m: ToastManager) => {
  held.toast = m;
};
function renderProvider(props: Parameters<typeof ToastProvider>[0] = {}) {
  return render(
    <ToastProvider {...props}>
      <Grab onToast={grab} />
    </ToastProvider>,
  );
}

it('add renders title, description, and data-tone; returns an id', async () => {
  renderProvider();
  let id = '';
  act(() => {
    id = held.toast!.add({
      title: 'Saved',
      description: 'All good',
      tone: 'success',
    });
  });
  expect(id).toEqual(expect.any(String));
  const title = await screen.findByText('Saved');
  expect(screen.getByText('All good')).toBeInTheDocument();
  expect(title.closest('[data-tone]')).toHaveAttribute('data-tone', 'success');
});

it('update changes an open toast; close(id) closes one; close() closes all', async () => {
  renderProvider();
  let a = '';
  act(() => {
    a = held.toast!.add({ title: 'A', duration: 0 });
    held.toast!.add({ title: 'B', duration: 0 });
  });
  await screen.findByText('A');
  act(() => held.toast!.update(a, { title: 'A2' }));
  expect(await screen.findByText('A2')).toBeInTheDocument();
  act(() => held.toast!.close(a));
  await vi.waitFor(() => expect(screen.queryByText('A2')).toBeNull());
  expect(screen.getByText('B')).toBeInTheDocument();
  act(() => {
    held.toast!.add({ title: 'C', duration: 0 });
  });
  await screen.findByText('C');
  act(() => held.toast!.close());
  await vi.waitFor(() => {
    expect(screen.queryByText('B')).toBeNull();
    expect(screen.queryByText('C')).toBeNull();
  });
});

it('action runs onClick, then closes its toast', async () => {
  const calls: string[] = [];
  const onClick = vi.fn(() =>
    calls.push(screen.queryByText('Failed') ? 'open' : 'closed'),
  );
  renderProvider();
  act(() => {
    held.toast!.add({ title: 'Failed', action: { label: 'Retry', onClick } });
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  // The toast is still open when onClick runs.
  expect(calls).toEqual(['open']);
  await vi.waitFor(() => expect(screen.queryByText('Failed')).toBeNull());
});

it('the dismiss button is named by closeLabel and is not aria-hidden', async () => {
  renderProvider({ closeLabel: 'Close it' });
  act(() => {
    held.toast!.add({ title: 'Hi', duration: 0 });
  });
  const button = await screen.findByRole('button', { name: 'Close it' });
  expect(button).toHaveAttribute('aria-hidden', 'false');
});

it('the viewport is named by viewportLabel', async () => {
  renderProvider({ viewportLabel: 'Alerts' });
  act(() => {
    held.toast!.add({ title: 'Hi', duration: 0 });
  });
  await screen.findByText('Hi');
  expect(screen.getByRole('region', { name: 'Alerts' })).toBeInTheDocument();
});

it('useToast outside a provider throws', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
  expect(() => render(<Grab />)).toThrow(
    'useToast must be used inside a ToastProvider',
  );
  spy.mockRestore();
});

it('a manager from createToastManager shows toasts when passed as manager', async () => {
  const manager = createToastManager();
  render(<ToastProvider manager={manager} />);
  act(() => {
    manager.add({ title: 'From outside', tone: 'info' });
  });
  const title = await screen.findByText('From outside');
  expect(title.closest('[data-tone]')).toHaveAttribute('data-tone', 'info');
});

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe.each([
  ['useToast', () => renderProvider({ duration: 100 }), () => held.toast!],
  [
    'createToastManager',
    () => {
      const manager = createToastManager();
      render(<ToastProvider duration={100} manager={manager} />);
      return manager;
    },
    undefined,
  ],
])("the provider's duration through %s", (_name, setup, get) => {
  it('closes an ordinary toast, and keeps a danger and an action toast', async () => {
    const made = setup();
    const manager = get ? get() : (made as ToastManager);
    act(() => {
      manager.add({ title: 'Plain' });
      manager.add({ title: 'Urgent', tone: 'danger' });
      manager.add({
        title: 'Undo',
        action: { label: 'Undo it', onClick: vi.fn() },
      });
    });
    await screen.findByText('Plain');
    await vi.waitFor(() => expect(screen.queryByText('Plain')).toBeNull());
    await pause(300);
    expect(screen.getAllByText('Urgent').length).toBeGreaterThan(0);
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('update: danger to success times out; neutral to danger stays', async () => {
    const made = setup();
    const manager = get ? get() : (made as ToastManager);
    let a = '';
    let b = '';
    act(() => {
      a = manager.add({ title: 'A', tone: 'danger' });
      b = manager.add({ title: 'B' });
    });
    await screen.findByText('B');
    act(() => {
      manager.update(a, { tone: 'success' });
      manager.update(b, { tone: 'danger' });
    });
    await vi.waitFor(() => expect(screen.queryByText('A')).toBeNull());
    await pause(300);
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
  });
});

describe("update keeps the toast's own action and duration", () => {
  it('a toast with an action stays when its tone changes', async () => {
    renderProvider({ duration: 100 });
    let id = '';
    act(() => {
      id = held.toast!.add({
        title: 'Undo',
        action: { label: 'Undo it', onClick: vi.fn() },
      });
    });
    await screen.findByText('Undo');
    act(() => held.toast!.update(id, { tone: 'neutral' }));
    await pause(300);
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('a toast made with duration 0 stays when its tone changes', async () => {
    renderProvider({ duration: 100 });
    let id = '';
    act(() => {
      id = held.toast!.add({ title: 'Stays', duration: 0 });
    });
    await screen.findByText('Stays');
    act(() => held.toast!.update(id, { tone: 'success' }));
    await pause(300);
    expect(screen.getByText('Stays')).toBeInTheDocument();
  });
});

describe('promise', () => {
  it('loading is neutral with a spinner and never times out; success follows the provider', async () => {
    renderProvider({ duration: 100 });
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    act(() => {
      void held.toast!.promise(p, {
        loading: 'Saving',
        success: 'Saved',
        error: 'Failed',
      });
    });
    const loading = (await screen.findByText('Saving')).closest('[data-tone]')!;
    expect(loading).toHaveAttribute('data-tone', 'neutral');
    expect(
      loading.querySelector('svg path[d="M21 12a9 9 0 0 0-9-9"]'),
    ).not.toBeNull();
    await pause(300);
    expect(screen.getByText('Saving')).toBeInTheDocument();
    await act(() => Promise.resolve(resolve('ok')));
    const saved = (await screen.findByText('Saved')).closest('[data-tone]')!;
    expect(saved).toHaveAttribute('data-tone', 'success');
    expect(
      saved.querySelector('svg path[d="M21 12a9 9 0 0 0-9-9"]'),
    ).toBeNull();
    await vi.waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  });

  it('an error result is danger and stays', async () => {
    renderProvider({ duration: 100 });
    const p = Promise.reject(new Error('boom'));
    p.catch(() => undefined);
    act(() => {
      void held
        .toast!.promise(p, {
          loading: 'Saving',
          success: 'Saved',
          error: (e) => ({
            title: 'Failed',
            description: (e as Error).message,
          }),
        })
        .catch(() => undefined);
    });
    const title = (await screen.findAllByText('Failed'))[0]!;
    expect(title.closest('[data-tone]')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getAllByText('boom').length).toBeGreaterThan(0);
    await pause(300);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
  });

  it('accepts strings, options, and functions of the result, error, or nothing', async () => {
    renderProvider({ duration: 0 });
    let resolve!: (v: number) => void;
    const p = new Promise<number>((r) => (resolve = r));
    act(() => {
      void held.toast!.promise(p, {
        loading: () => ({ title: 'Working', description: 'Hold on' }),
        success: (n) => `Got ${n}`,
        error: 'Nope',
      });
    });
    await screen.findByText('Working');
    expect(screen.getByText('Hold on')).toBeInTheDocument();
    await act(() => Promise.resolve(resolve(7)));
    await screen.findByText('Got 7');
    expect(screen.queryByText('Hold on')).toBeNull();
  });

  it("a state's own tone and duration override the defaults", async () => {
    renderProvider({ duration: 100 });
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    act(() => {
      void held.toast!.promise(p, {
        loading: { title: 'Saving', tone: 'info' },
        success: { title: 'Saved', tone: 'warning', duration: 0 },
        error: 'Failed',
      });
    });
    const loading = (await screen.findByText('Saving')).closest('[data-tone]')!;
    expect(loading).toHaveAttribute('data-tone', 'info');
    await act(() => Promise.resolve(resolve('x')));
    const saved = (await screen.findByText('Saved')).closest('[data-tone]')!;
    expect(saved).toHaveAttribute('data-tone', 'warning');
    await pause(300);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('returns the original promise: a rejection still rejects, a value still resolves', async () => {
    renderProvider({ duration: 0 });
    const states = { loading: 'L', success: 'S', error: 'E' };
    await expect(
      held.toast!.promise(Promise.reject(new Error('x')), states),
    ).rejects.toThrow('x');
    await expect(held.toast!.promise(Promise.resolve(5), states)).resolves.toBe(
      5,
    );
  });

  it('a dismissed loading toast does not reappear when the promise settles', async () => {
    renderProvider({ duration: 0 });
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    let result!: Promise<string>;
    act(() => {
      result = held.toast!.promise(p, {
        loading: 'Saving',
        success: 'Saved',
        error: 'Failed',
      });
    });
    await screen.findByText('Saving');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await vi.waitFor(() => expect(screen.queryByText('Saving')).toBeNull());
    await act(() => Promise.resolve(resolve('ok')));
    await expect(result).resolves.toBe('ok');
    await pause(100);
    expect(screen.queryByText('Saved')).toBeNull();
    expect(screen.queryByText('Saving')).toBeNull();
  });

  it('works through createToastManager too', async () => {
    const manager = createToastManager();
    render(<ToastProvider manager={manager} duration={0} />);
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    act(() => {
      void manager.promise(p, { loading: 'L', success: 'S', error: 'E' });
    });
    await screen.findByText('L');
    await act(() => Promise.resolve(resolve('x')));
    await screen.findByText('S');
  });
});
