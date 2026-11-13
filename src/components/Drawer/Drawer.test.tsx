import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { warnOnce } from '../../utils/warn';
import { Button } from '../Button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentProps,
  type DrawerProps,
} from './index';

function Example({
  content,
  children,
  ...props
}: DrawerProps & { content?: Partial<DrawerContentProps> }) {
  return (
    <Drawer {...props}>
      <DrawerTrigger>
        <Button>Open</Button>
      </DrawerTrigger>
      <DrawerContent {...content}>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow down the list.</DrawerDescription>
        {children}
        <DrawerClose>
          <Button>Done</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

// `warnOnce` dedupes per key for the whole file, so assert on the call instead.
vi.mock('../../utils/warn', () => ({ warnOnce: vi.fn() }));

const lastMessage = () => String(vi.mocked(warnOnce).mock.calls[0]![1]);
const warned = () => vi.mocked(warnOnce).mock.calls.map(([key]) => key);

const open = () =>
  userEvent.click(screen.getByRole('button', { name: 'Open' }));

it('uncontrolled: the trigger opens it; DrawerClose closes it', async () => {
  render(<Example />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await open();
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  await expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('controlled: onOpenChange receives only the boolean', async () => {
  const onOpenChange = vi.fn();
  render(<Example open={false} onOpenChange={onOpenChange} />);
  await open();
  expect(onOpenChange).toHaveBeenCalledWith(true);
  // Controlled: nothing opens until `open` does.
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('defaultOpen starts it open', async () => {
  render(<Example defaultOpen />);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

it('the trigger child gets props and ref, and keeps its own onClick', async () => {
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <Drawer>
      <DrawerTrigger data-extra="yes">
        <Button ref={ref} onClick={onClick}>
          Open
        </Button>
      </DrawerTrigger>
      <DrawerContent aria-label="Hi">Body</DrawerContent>
    </Drawer>,
  );
  const button = screen.getByRole('button', { name: 'Open' });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute('data-extra', 'yes');
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

it('DrawerTitle is an h2 naming the drawer; DrawerDescription is a p describing it', async () => {
  render(<Example defaultOpen />);
  const dialog = await screen.findByRole('dialog', { name: 'Filters' });
  expect(
    screen.getByRole('heading', { level: 2, name: 'Filters' }),
  ).toBeInTheDocument();
  const description = screen.getByText('Narrow down the list.');
  expect(description.tagName).toBe('P');
  expect(dialog).toHaveAccessibleDescription('Narrow down the list.');
});

it('content is not in the DOM while closed', async () => {
  render(<Example />);
  expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  await open();
  expect(await screen.findByText('Filters')).toBeInTheDocument();
});

it('the close button is last in the popup, named by closeLabel ("Close" by default)', async () => {
  const { unmount } = render(<Example defaultOpen />);
  let dialog = await screen.findByRole('dialog');
  // Popup > content > its last child.
  expect(dialog.lastElementChild!.lastElementChild).toHaveAccessibleName(
    'Close',
  );
  unmount();
  render(
    <Drawer defaultOpen>
      <DrawerContent closeLabel="Dismiss" aria-label="Hi">
        Body
      </DrawerContent>
    </Drawer>,
  );
  dialog = await screen.findByRole('dialog');
  expect(dialog.lastElementChild!.lastElementChild).toHaveAccessibleName(
    'Dismiss',
  );
});

it('showClose={false} omits the close button', async () => {
  render(
    <Drawer defaultOpen>
      <DrawerContent showClose={false} aria-label="Hi">
        <DrawerClose>
          <Button>Done</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>,
  );
  await screen.findByRole('dialog');
  expect(
    screen.queryByRole('button', { name: 'Close' }),
  ).not.toBeInTheDocument();
});

it('open: DrawerContent has data-open and data-side (end by default), and the trigger child has data-popup-open', async () => {
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open' });
  expect(trigger).not.toHaveAttribute('data-popup-open');
  await userEvent.click(trigger);
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveAttribute('data-open');
  expect(dialog).toHaveAttribute('data-side', 'end');
  expect(trigger).toHaveAttribute('data-popup-open');
});

it.each(['start', 'end', 'bottom'] as const)(
  'data-side is %s',
  async (side) => {
    render(<Example defaultOpen content={{ side }} />);
    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-side',
      side,
    );
  },
);

describe('swipe direction and dir', () => {
  it.each([
    ['start', 'ltr', 'left'],
    ['start', 'rtl', 'right'],
    ['end', 'ltr', 'right'],
    ['end', 'rtl', 'left'],
    ['bottom', 'ltr', 'down'],
  ] as const)('%s with dir="%s" swipes %s', async (side, dir, swipe) => {
    render(<Example defaultOpen content={{ side, dir }} />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('dir', dir);
    expect(dialog).toHaveAttribute('data-swipe-direction', swipe);
  });

  it("follows the document's direction without a dir prop", async () => {
    document.documentElement.dir = 'rtl';
    try {
      render(<Example defaultOpen content={{ side: 'start' }} />);
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveAttribute('dir', 'rtl');
      expect(dialog).toHaveAttribute('data-swipe-direction', 'right');
    } finally {
      document.documentElement.removeAttribute('dir');
    }
  });
});

describe('outside click', () => {
  it('closes it by default', async () => {
    render(<Example />);
    await open();
    await screen.findByRole('dialog');
    await userEvent.click(document.body);
    await expect
      .poll(() => screen.queryByRole('dialog'))
      .not.toBeInTheDocument();
  });

  it('does not with closeOnOutsideClick={false}', async () => {
    render(<Example closeOnOutsideClick={false} />);
    await open();
    await screen.findByRole('dialog');
    await userEvent.click(document.body);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('development warnings', () => {
  beforeEach(() => vi.mocked(warnOnce).mockClear());

  it('warns without a title or aria-label', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>Body</DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['drawer-name']);
    expect(lastMessage()).toMatch(/DrawerContent.*DrawerTitle.*aria-label/);
  });

  it('does not warn with a title, description, and close button', async () => {
    render(<Example defaultOpen />);
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn about the name with an aria-label', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent aria-label="Hi">Body</DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('warns when there is no close button and no DrawerClose', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent showClose={false} aria-label="Hi">
          Body
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['drawer-no-close']);
    expect(lastMessage()).toMatch(
      /DrawerContent.*no close button.*add a `DrawerClose`/,
    );
  });

  it('does not warn about the close button when a DrawerClose is present', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent showClose={false} aria-label="Hi">
          <DrawerClose>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('warns when controlled with no DrawerTrigger and no finalFocus', async () => {
    render(
      <Drawer open>
        <DrawerContent aria-label="Hi">Body</DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['drawer-final-focus']);
    expect(lastMessage()).toMatch(/Drawer: .*no `DrawerTrigger`.*`finalFocus`/);
  });

  it('does not warn when controlled with a finalFocus', async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Drawer open>
        <DrawerContent aria-label="Hi" finalFocus={ref}>
          Body
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn when controlled with a DrawerTrigger', async () => {
    render(<Example open />);
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn when uncontrolled with no DrawerTrigger', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent aria-label="Hi">Body</DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });
});
