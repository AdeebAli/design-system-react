import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { warnOnce } from '../../utils/warn';
import { Button } from '../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from './index';

function Example({
  children,
  ...props
}: DialogProps & { children?: ReactNode }) {
  return (
    <Dialog {...props}>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Your team will see this.</DialogDescription>
        {children}
        <DialogClose>
          <Button>Cancel</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

// `warnOnce` dedupes per key for the whole file, so assert on the call instead.
vi.mock('../../utils/warn', () => ({ warnOnce: vi.fn() }));

const lastMessage = () => String(vi.mocked(warnOnce).mock.calls[0]![1]);

const warned = () => vi.mocked(warnOnce).mock.calls.map(([key]) => key);

const open = () =>
  userEvent.click(screen.getByRole('button', { name: 'Open' }));

it('uncontrolled: the trigger opens it; DialogClose closes it', async () => {
  render(<Example />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await open();
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('controlled: onOpenChange receives only the boolean', async () => {
  const onOpenChange = vi.fn();
  render(<Example open={false} onOpenChange={onOpenChange} />);
  await open();
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  // Controlled: nothing opens until `open` does.
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('the trigger child gets props and ref, and keeps its own onClick', async () => {
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <Dialog>
      <DialogTrigger data-extra="yes">
        <Button ref={ref} onClick={onClick}>
          Open
        </Button>
      </DialogTrigger>
      <DialogContent aria-label="Hi">Body</DialogContent>
    </Dialog>,
  );
  const button = screen.getByRole('button', { name: 'Open' });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute('data-extra', 'yes');
  expect(button.tagName).toBe('BUTTON');
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

it('DialogTitle is an h2 naming the dialog; DialogDescription is a p describing it', async () => {
  render(<Example defaultOpen />);
  const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
  expect(
    screen.getByRole('heading', { level: 2, name: 'Edit profile' }),
  ).toBeInTheDocument();
  const description = screen.getByText('Your team will see this.');
  expect(description.tagName).toBe('P');
  expect(dialog).toHaveAccessibleDescription('Your team will see this.');
});

it('the close button is last in the popup, named by closeLabel ("Close" by default)', async () => {
  const { unmount } = render(<Example defaultOpen />);
  let dialog = await screen.findByRole('dialog');
  let last = dialog.lastElementChild!;
  expect(last.tagName).toBe('BUTTON');
  expect(last).toHaveAccessibleName('Close');
  unmount();
  render(
    <Dialog defaultOpen>
      <DialogContent closeLabel="Dismiss" aria-label="Hi">
        Body
      </DialogContent>
    </Dialog>,
  );
  dialog = await screen.findByRole('dialog');
  last = dialog.lastElementChild!;
  expect(last).toHaveAccessibleName('Dismiss');
});

it('alert renders role="alertdialog" with no close button', async () => {
  render(<Example alert defaultOpen />);
  const dialog = await screen.findByRole('alertdialog');
  expect(
    screen.queryByRole('button', { name: 'Close' }),
  ).not.toBeInTheDocument();
  expect(dialog).toBeInTheDocument();
});

it('showClose={false} omits the close button', async () => {
  render(
    <Dialog defaultOpen>
      <DialogContent showClose={false} aria-label="Hi">
        <DialogClose>
          <Button>Done</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>,
  );
  await screen.findByRole('dialog');
  expect(
    screen.queryByRole('button', { name: 'Close' }),
  ).not.toBeInTheDocument();
});

it('open: DialogContent has data-open and the trigger child has data-popup-open', async () => {
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open' });
  expect(trigger).not.toHaveAttribute('data-popup-open');
  await userEvent.click(trigger);
  expect(await screen.findByRole('dialog')).toHaveAttribute('data-open');
  expect(trigger).toHaveAttribute('data-popup-open');
});

describe('development warnings', () => {
  beforeEach(() => vi.mocked(warnOnce).mockClear());

  it('warns without a title or aria-label', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>Body</DialogContent>
      </Dialog>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['dialog-name']);
    expect(lastMessage()).toMatch(/DialogContent.*DialogTitle.*aria-label/);
  });

  it('does not warn with a title, description, and close button', async () => {
    render(<Example defaultOpen />);
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn about the name with an aria-label', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent aria-label="Hi">Body</DialogContent>
      </Dialog>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('warns for alert without a DialogDescription', async () => {
    render(
      <Dialog alert defaultOpen>
        <DialogContent aria-label="Delete?">
          <DialogClose>
            <Button>Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    await screen.findByRole('alertdialog');
    expect(warned()).toEqual(['dialog-alert-description']);
    expect(lastMessage()).toMatch(
      /Dialog: .*`alert`.*should have a `DialogDescription`/,
    );
  });

  it('warns when there is no close button and no DialogClose', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showClose={false} aria-label="Hi">
          Body
        </DialogContent>
      </Dialog>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['dialog-no-close']);
    expect(lastMessage()).toMatch(
      /DialogContent.*no close button.*add a `DialogClose`/,
    );
  });

  it('warns for closeOnOutsideClick with alert', () => {
    render(
      <Dialog alert closeOnOutsideClick>
        <DialogContent aria-label="Hi">Body</DialogContent>
      </Dialog>,
    );
    expect(warned()).toEqual(['dialog-alert-outside-click']);
    expect(lastMessage()).toMatch(
      /Dialog: `closeOnOutsideClick` is ignored with `alert`.*Remove it/,
    );
  });
});
