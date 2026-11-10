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
  const onClick = vi.fn(() => calls.push('click'));
  renderProvider();
  act(() => {
    held.toast!.add({ title: 'Failed', action: { label: 'Retry', onClick } });
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  // The toast is still open when onClick runs.
  expect(calls).toEqual(['click']);
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

it('an urgent toast stays in the accessibility tree, since it holds buttons', async () => {
  renderProvider();
  act(() => {
    held.toast!.add({ title: 'Failed', tone: 'danger' });
  });
  // The hidden alert repeats the text, so find the toast by its role.
  expect(await screen.findByRole('alertdialog')).toHaveAttribute(
    'data-tone',
    'danger',
  );
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
});
