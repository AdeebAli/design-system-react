import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { warnOnce } from '../../utils/warn';
import { Button } from '../Button';
import * as styles from './Popover.css';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
} from './index';

function Example({
  children,
  content,
  ...props
}: PopoverProps & { content?: Partial<PopoverContentProps> }) {
  return (
    <Popover {...props}>
      <PopoverTrigger>
        <Button>Open</Button>
      </PopoverTrigger>
      <PopoverContent {...content}>
        <PopoverTitle>Filters</PopoverTitle>
        <PopoverDescription>Narrow the list.</PopoverDescription>
        {children}
        <PopoverClose>
          <Button>Done</Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

// `warnOnce` dedupes per key for the whole file, so assert on the call instead.
vi.mock('../../utils/warn', () => ({ warnOnce: vi.fn() }));

const lastMessage = () => String(vi.mocked(warnOnce).mock.calls[0]![1]);
const warned = () => vi.mocked(warnOnce).mock.calls.map(([key]) => key);
const open = () =>
  userEvent.click(screen.getByRole('button', { name: 'Open' }));

it('uncontrolled: the trigger opens it; PopoverClose closes it', async () => {
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
  expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  // Controlled: nothing opens until `open` does.
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('the trigger child gets props and ref, and keeps its own onClick', async () => {
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <Popover>
      <PopoverTrigger data-extra="yes">
        <Button ref={ref} onClick={onClick}>
          Open
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Hi">Body</PopoverContent>
    </Popover>,
  );
  const button = screen.getByRole('button', { name: 'Open' });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute('data-extra', 'yes');
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

it('PopoverTitle is an h2 naming the popup; PopoverDescription is a p describing it', async () => {
  render(<Example defaultOpen />);
  const popup = await screen.findByRole('dialog', { name: 'Filters' });
  expect(
    screen.getByRole('heading', { level: 2, name: 'Filters' }),
  ).toBeInTheDocument();
  const description = screen.getByText('Narrow the list.');
  expect(description.tagName).toBe('P');
  expect(popup).toHaveAccessibleDescription('Narrow the list.');
});

it('aria-label names the popup', async () => {
  render(
    <Popover defaultOpen>
      <PopoverContent aria-label="Filters">Body</PopoverContent>
    </Popover>,
  );
  expect(
    await screen.findByRole('dialog', { name: 'Filters' }),
  ).toBeInTheDocument();
});

it('layout props apply to the popup', async () => {
  const { unmount } = render(<Example defaultOpen />);
  const plain = (await screen.findByRole('dialog')).className;
  unmount();
  render(
    <Example
      defaultOpen
      content={{ width: 'full', maxWidth: 'container.sm' }}
    />,
  );
  const classes = (await screen.findByRole('dialog')).className.split(' ');
  // Layout props compile to classes next to the surface classes (measured in the browser tests).
  expect(
    classes.filter((name) => !plain.split(' ').includes(name)),
  ).not.toEqual([]);
});

it('arrow renders only when set', async () => {
  const { unmount } = render(<Example defaultOpen />);
  await screen.findByRole('dialog');
  expect(document.querySelector(`.${styles.arrow}`)).toBeNull();
  unmount();
  render(<Example defaultOpen content={{ arrow: true }} />);
  const popup = await screen.findByRole('dialog');
  expect(popup.querySelectorAll(`.${styles.arrow}`)).toHaveLength(1);
});

it('open: PopoverContent has data-open and the trigger child has data-popup-open', async () => {
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
      <Popover defaultOpen>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual(['popover-name']);
    expect(lastMessage()).toMatch(/PopoverContent.*PopoverTitle.*aria-label/);
  });

  it('does not warn with a title', async () => {
    render(<Example defaultOpen />);
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn with an aria-label', async () => {
    render(
      <Popover defaultOpen>
        <PopoverContent aria-label="Hi">Body</PopoverContent>
      </Popover>,
    );
    await screen.findByRole('dialog');
    expect(warned()).toEqual([]);
  });

  it('does not warn while closed', () => {
    render(
      <Popover>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    expect(warned()).toEqual([]);
  });
});
