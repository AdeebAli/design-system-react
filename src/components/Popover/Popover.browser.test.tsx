import { render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import * as styles from './Popover.css';
import { Button } from '../Button';
import type { OverlaySide } from '../overlays/positioning';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
} from './index';

function Example({
  content,
  place = {},
  ...props
}: PopoverProps & {
  content?: Partial<PopoverContentProps>;
  /** Where the trigger sits, as inline-style offsets. */
  place?: React.CSSProperties;
}) {
  return (
    <>
      <Popover {...props}>
        <PopoverTrigger>
          <Button style={{ position: 'fixed', ...place }}>Open</Button>
        </PopoverTrigger>
        <PopoverContent {...content}>
          <PopoverTitle>Filters</PopoverTitle>
          <input aria-label="Search" />
          <PopoverClose>
            <Button>Done</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        style={{ position: 'fixed', insetBlockEnd: 0, insetInlineEnd: 0 }}
      >
        Outside
      </button>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Open' });
const settled = async () => {
  const popup = await screen.findByRole('dialog');
  await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
  return popup;
};
const closed = () =>
  expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();

afterEach(async () => {
  document.documentElement.removeAttribute('dir');
  await page.viewport(414, 896);
});

const arrow = () =>
  document.querySelector<HTMLElement>(`.${styles.arrow}`)!;
const center = (rect: DOMRect, axis: 'x' | 'y') =>
  axis === 'x' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;

it('focus moves into the popup and returns to the trigger on close', async () => {
  render(<Example />);
  await userEvent.click(trigger());
  const popup = await settled();
  await expect.poll(() => popup.contains(document.activeElement)).toBe(true);
  expect(document.activeElement).toBe(
    screen.getByRole('textbox', { name: 'Search' }),
  );
  await userEvent.keyboard('{Escape}');
  await closed();
  await expect.poll(() => document.activeElement).toBe(trigger());
});

it('the page stays usable: clicking a button outside closes it and works', async () => {
  const onClick = vi.fn();
  render(
    <>
      <Example />
      <button
        type="button"
        style={{ position: 'fixed', insetBlockEnd: 60, insetInlineEnd: 0 }}
        onClick={onClick}
      >
        Elsewhere
      </button>
    </>,
  );
  await userEvent.click(trigger());
  await settled();
  await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
  await closed();
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('Escape and an outside click close it', async () => {
  render(<Example />);
  await userEvent.click(trigger());
  await settled();
  await userEvent.keyboard('{Escape}');
  await closed();
  await userEvent.click(trigger());
  await settled();
  await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
  await closed();
});

describe('the arrow', () => {
  const sides: [OverlaySide, 'x' | 'y'][] = [
    ['top', 'x'],
    ['bottom', 'x'],
    ['start', 'y'],
    ['end', 'y'],
  ];

  it.each(sides)(
    'side=%s: its center is within 1px of the trigger center',
    async (side, axis) => {
      await page.viewport(1000, 800);
      render(
        <Example
          content={{ side, arrow: true }}
          place={{ insetBlockStart: 400, insetInlineStart: 450 }}
        />,
      );
      await userEvent.click(trigger());
      await settled();
      await expect
        .poll(() =>
          Math.abs(
            center(arrow().getBoundingClientRect(), axis) -
              center(trigger().getBoundingClientRect(), axis),
          ),
        )
        .toBeLessThanOrEqual(1);
    },
  );

  it('stays centered after flipping near the bottom edge', async () => {
    render(
      <Example
        content={{ side: 'bottom', arrow: true }}
        place={{ insetBlockEnd: 40, insetInlineStart: 180 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger().getBoundingClientRect().top,
    );
    await expect
      .poll(() =>
        Math.abs(
          center(arrow().getBoundingClientRect(), 'x') -
            center(trigger().getBoundingClientRect(), 'x'),
        ),
      )
      .toBeLessThanOrEqual(1);
    // The flipped arrow sits on the popup's bottom edge.
    expect(arrow().getAttribute('data-side')).toBe('top');
  });

  it('sits on the popup edge facing the trigger', async () => {
    render(
      <Example
        content={{ side: 'bottom', arrow: true }}
        place={{ insetBlockStart: 100, insetInlineStart: 180 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(
      Math.abs(
        center(arrow().getBoundingClientRect(), 'y') -
          popup.getBoundingClientRect().top,
      ),
    ).toBeLessThanOrEqual(1);
  });
});

describe('flipping with side="end"', () => {
  it('flips to the start side near the inline-end edge in LTR', async () => {
    render(
      <Example
        content={{ side: 'end', width: 'full' }}
        place={{ insetBlockStart: 300, insetInlineEnd: 4 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(
      trigger().getBoundingClientRect().left,
    );
  });

  it('flips to the right near the left edge in RTL', async () => {
    document.documentElement.dir = 'rtl';
    render(
      <Example
        content={{ side: 'end' }}
        place={{ insetBlockStart: 300, left: 4 }}
      />,
    );
    await userEvent.click(trigger());
    const popup = await settled();
    expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      trigger().getBoundingClientRect().right,
    );
    // Asked for the end side, which is the left in RTL and has no room, so it
    // flipped to the start side. In LTR, with no flip, it would stay `inline-end`.
    expect(popup.getAttribute('data-side')).toBe('inline-start');
  });

  it('stays on the end side with room: right in LTR, left in RTL', async () => {
    await page.viewport(1000, 600);
    const place = { insetBlockStart: 300, left: 500 };
    const { unmount } = render(
      <Example content={{ side: 'end' }} place={place} />,
    );
    await userEvent.click(trigger());
    let popup = await settled();
    expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      trigger().getBoundingClientRect().right,
    );
    expect(popup.getAttribute('data-side')).toBe('inline-end');
    unmount();
    document.documentElement.dir = 'rtl';
    render(<Example content={{ side: 'end' }} place={place} />);
    await userEvent.click(trigger());
    popup = await settled();
    expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(
      trigger().getBoundingClientRect().left,
    );
    expect(popup.getAttribute('data-side')).toBe('inline-end');
  });
});

describe('side="start" and "end" follow text direction (centered trigger, room on both sides)', () => {
  const place = { insetBlockStart: 300, left: 500 };
  const open = async (
    side: 'start' | 'end',
    dir: 'ltr' | 'rtl',
    arrow = false,
  ) => {
    await page.viewport(1000, 600);
    document.documentElement.dir = dir;
    render(<Example content={{ side, arrow }} place={place} />);
    await userEvent.click(trigger());
    return settled();
  };

  it.each([
    ['start', 'ltr', 'left'],
    ['end', 'ltr', 'right'],
    ['start', 'rtl', 'right'],
    ['end', 'rtl', 'left'],
  ] as const)('side=%s in %s opens on the %s', async (side, dir, physical) => {
    const popup = await open(side, dir);
    const p = popup.getBoundingClientRect();
    const t = trigger().getBoundingClientRect();
    if (physical === 'left') expect(p.right).toBeLessThanOrEqual(t.left);
    else expect(p.left).toBeGreaterThanOrEqual(t.right);
  });

  it.each(['ltr', 'rtl'] as const)(
    'the arrow sits on the popup edge facing the trigger in %s',
    async (dir) => {
      const popup = await open('end', dir, true);
      const p = popup.getBoundingClientRect();
      const t = trigger().getBoundingClientRect();
      // The popup is right of the trigger in LTR and left of it in RTL, so
      // the edge facing the trigger is its left in LTR and its right in RTL.
      if (dir === 'ltr') expect(p.left).toBeGreaterThanOrEqual(t.right);
      else expect(p.right).toBeLessThanOrEqual(t.left);
      const facing = dir === 'ltr' ? p.left : p.right;
      await expect
        .poll(() =>
          Math.abs(center(arrow().getBoundingClientRect(), 'x') - facing),
        )
        .toBeLessThanOrEqual(1);
      expect(
        Math.abs(
          center(arrow().getBoundingClientRect(), 'y') - center(t, 'y'),
        ),
      ).toBeLessThanOrEqual(1);
    },
  );
});

it('layout props size the popup', async () => {
  await page.viewport(1000, 600);
  render(<Example content={{ width: 'container.sm' }} />);
  await userEvent.click(trigger());
  const popup = await settled();
  // container.sm is 40rem.
  const expected =
    40 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  expect(popup.getBoundingClientRect().width).toBe(expected);
});

it('at 320 wide, the popup is never wider than the viewport', async () => {
  await page.viewport(320, 600);
  render(<Example content={{ width: 'container.xl' }} />);
  await userEvent.click(trigger());
  const popup = await settled();
  const rect = popup.getBoundingClientRect();
  expect(rect.width).toBeLessThanOrEqual(320);
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.right).toBeLessThanOrEqual(320);
});
