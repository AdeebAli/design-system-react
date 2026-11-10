import { render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { cdp, page, userEvent } from 'vitest/browser';
import * as styles from './Dialog.css';
import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogProps,
} from './index';

function Example({
  content,
  ...props
}: DialogProps & { content?: Partial<DialogContentProps> }) {
  return (
    <>
      <Dialog {...props}>
        <DialogTrigger>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent {...content}>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Your team will see this.</DialogDescription>
          <Field label="Name">
            <Input />
          </Field>
          <DialogClose>
            <Button>Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <button type="button">After</button>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Open' });
const closeButton = () => screen.getByRole('button', { name: 'Close' });
const settled = async () => {
  const popup = await screen.findByRole('dialog');
  await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
  return popup;
};
const closed = () =>
  expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();

async function emulate(features: { name: string; value: string }[]) {
  await cdp().send('Emulation.setEmulatedMedia', { features });
}

afterEach(async () => {
  await emulate([]);
  await page.viewport(414, 896);
});

it('Tab and Shift+Tab cycle inside the dialog', async () => {
  render(<Example />);
  await userEvent.click(trigger());
  const popup = await settled();
  const name = screen.getByRole('textbox', { name: 'Name' });
  // The first focusable element gets focus, not the close button.
  await expect.poll(() => document.activeElement).toBe(name);
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.tab();
  expect(closeButton()).toHaveFocus();
  await userEvent.tab();
  expect(popup.contains(document.activeElement)).toBe(true);
  expect(document.activeElement).not.toBe(screen.getByText('After'));
  await userEvent.tab({ shift: true });
  expect(closeButton()).toHaveFocus();
  for (let i = 0; i < 8; i++) {
    await userEvent.tab();
    expect(popup.contains(document.activeElement)).toBe(true);
  }
});

it('focus returns to the trigger on close', async () => {
  render(<Example />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await closed();
  await expect.poll(() => document.activeElement).toBe(trigger());
});

it('focus returns to finalFocus when given', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <>
      <button ref={ref} type="button">
        Elsewhere
      </button>
      <Example content={{ finalFocus: ref }} />
    </>,
  );
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await closed();
  await expect.poll(() => document.activeElement).toBe(ref.current);
});

it('initialFocus wins over the first focusable element', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Dialog>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent aria-label="Pick" initialFocus={ref}>
        <Input aria-label="First" />
        <button ref={ref} type="button">
          Chosen
        </button>
      </DialogContent>
    </Dialog>,
  );
  await userEvent.click(trigger());
  await settled();
  await expect.poll(() => document.activeElement).toBe(ref.current);
});

it('Escape closes it, with alert too', async () => {
  const { unmount } = render(<Example />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await closed();
  unmount();
  render(<Example alert />);
  await userEvent.click(trigger());
  await screen.findByRole('alertdialog');
  await userEvent.keyboard('{Escape}');
  await expect
    .poll(() => screen.queryByRole('alertdialog'))
    .not.toBeInTheDocument();
});

describe('outside click', () => {
  // The backdrop's top-left corner, clear of the centered popup.
  const clickOutside = () =>
    userEvent.click(
      document.querySelector<HTMLElement>(`.${styles.backdrop}`)!,
      { position: { x: 4, y: 4 } },
    );

  it('closes it', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await settled();
    await clickOutside();
    await closed();
  });

  it('does not with closeOnOutsideClick={false}', async () => {
    render(<Example closeOnOutsideClick={false} />);
    await userEvent.click(trigger());
    await settled();
    await clickOutside();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not with alert', async () => {
    render(<Example alert />);
    await userEvent.click(trigger());
    await screen.findByRole('alertdialog');
    await clickOutside();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});

it('locks scroll without shifting the page', async () => {
  // Headless Chromium here has no scrollbar gutter at all (even `overflow: scroll`
  // boxes and `::-webkit-scrollbar` rules give none), so the shift itself can't
  // be seen (and Base UI only adds the gutter when there is one). The test checks
  // the lock, and that the reference doesn't move.
  const tall = document.createElement('div');
  tall.style.cssText = 'height: 3000px; width: 100%;';
  const reference = document.createElement('div');
  reference.style.cssText =
    'width: 50px; height: 20px; margin-inline-start: auto;';
  document.body.append(reference, tall);
  try {
    const before = reference.getBoundingClientRect().left;
    render(<Example />);
    await userEvent.click(trigger());
    await settled();
    expect(reference.getBoundingClientRect().left).toBe(before);
    const root = getComputedStyle(document.documentElement);
    expect(
      [root.overflowY, getComputedStyle(document.body).overflowY].includes(
        'hidden',
      ),
    ).toBe(true);
    window.scrollTo(0, 0);
    await userEvent.wheel(document.body, { delta: { y: 200 } });
    expect(window.scrollY).toBe(0);
  } finally {
    reference.remove();
    tall.remove();
  }
});

it('tall content scrolls inside a popup that stays within the viewport', async () => {
  await page.viewport(800, 400);
  render(
    <Dialog defaultOpen>
      <DialogContent aria-label="Tall">
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i}>Paragraph {i}</p>
        ))}
      </DialogContent>
    </Dialog>,
  );
  const popup = await settled();
  const rect = popup.getBoundingClientRect();
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
  popup.scrollTop = 100;
  expect(popup.scrollTop).toBeGreaterThan(0);
});

it('at 320 wide, the popup is 320 - 2 * space.4 wide', async () => {
  await page.viewport(320, 600);
  render(<Example defaultOpen content={{ size: 'lg' }} />);
  const popup = await settled();
  const probe = document.createElement('div');
  probe.style.width = 'var(--ds-space-4)';
  document.body.append(probe);
  const edge = probe.getBoundingClientRect().width;
  probe.remove();
  expect(popup.getBoundingClientRect().width).toBe(320 - 2 * edge);
});

it('widths follow size.dialog tokens', async () => {
  await page.viewport(1200, 800);
  const sizes = { sm: 24, md: 32, lg: 44 } as const;
  for (const [size, rem] of Object.entries(sizes)) {
    const { unmount } = render(
      <Example defaultOpen content={{ size: size as 'sm' | 'md' | 'lg' }} />,
    );
    const popup = await settled();
    expect(popup.getBoundingClientRect().width).toBe(
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
    unmount();
  }
});

it('reduced motion still closes', async () => {
  await emulate([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  render(<Example />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await closed();
});

it('controlled open can be held open', async () => {
  function Held() {
    const [open, setOpen] = useState(false);
    return (
      <Example open={open} onOpenChange={(next) => next && setOpen(next)} />
    );
  }
  render(<Held />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
