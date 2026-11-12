import { render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { cdp, page, userEvent } from 'vitest/browser';
import * as styles from './Drawer.css';
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
  trigger = true,
  ...props
}: DrawerProps & { content?: Partial<DrawerContentProps>; trigger?: boolean }) {
  return (
    <>
      <Drawer {...props}>
        {trigger && (
          <DrawerTrigger>
            <Button>Open</Button>
          </DrawerTrigger>
        )}
        <DrawerContent {...(content as DrawerContentProps)}>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow down the list.</DrawerDescription>
          <input aria-label="Name" />
          <DrawerClose>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
      <button type="button">After</button>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Open' });
const closeButton = () => screen.getByRole('button', { name: 'Close' });
const IDENTITY = ['none', 'matrix(1, 0, 0, 1, 0, 0)'];
const settled = async () => {
  const popup = await screen.findByRole('dialog');
  await expect
    .poll(() => IDENTITY.includes(getComputedStyle(popup).transform))
    .toBe(true);
  return popup;
};
const closed = () =>
  expect.poll(() => screen.queryByRole('dialog')).not.toBeInTheDocument();

const px = (value: string) => {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
};
const space = (step: string) => px(`var(--ds-space-${step})`);
const rem = (count: number) =>
  count * parseFloat(getComputedStyle(document.documentElement).fontSize);

async function emulate(features: { name: string; value: string }[]) {
  await cdp().send('Emulation.setEmulatedMedia', { features });
}

afterEach(async () => {
  document.documentElement.removeAttribute('dir');
  await emulate([]);
  await page.viewport(414, 896);
});

describe('placement', () => {
  const bleed = () => space('12');
  // The popup also covers its bleed, past the screen edge it opens from.
  const expectOn = (popup: HTMLElement, physical: 'left' | 'right') => {
    const rect = popup.getBoundingClientRect();
    if (physical === 'right') {
      expect(rect.left).toBe(1200 - rem(28));
      expect(rect.right).toBe(1200 + bleed());
    } else {
      expect(rect.right).toBe(rem(28));
      expect(rect.left).toBe(-bleed());
    }
  };
  const rows = [
    ['start', 'ltr', 'left'],
    ['start', 'rtl', 'right'],
    ['end', 'ltr', 'right'],
    ['end', 'rtl', 'left'],
  ] as const;

  it.each(rows)(
    '%s in %s opens on the %s with a trigger',
    async (side, dir, physical) => {
      await page.viewport(1200, 800);
      document.documentElement.dir = dir;
      render(<Example content={{ side }} />);
      await userEvent.click(trigger());
      const popup = await settled();
      expectOn(popup, physical);
      expect(popup).toHaveAttribute('dir', dir);
    },
  );

  it.each(rows)(
    '%s in %s opens on the %s with no trigger',
    async (side, dir, physical) => {
      await page.viewport(1200, 800);
      document.documentElement.dir = dir;
      const ref = createRef<HTMLButtonElement>();
      render(
        <>
          <button ref={ref} type="button">
            Elsewhere
          </button>
          <Example open trigger={false} content={{ side, finalFocus: ref }} />
        </>,
      );
      expectOn(await settled(), physical);
    },
  );

  it('a controlled drawer with no trigger follows the root dir between two opens', async () => {
    await page.viewport(1200, 800);
    const ref = createRef<HTMLButtonElement>();
    function Held({ open }: { open: boolean }) {
      return (
        <>
          <button ref={ref} type="button">
            Elsewhere
          </button>
          <Example
            open={open}
            trigger={false}
            content={{ side: 'start', finalFocus: ref }}
          />
        </>
      );
    }
    const { rerender } = render(<Held open />);
    let popup = await settled();
    expect(popup.getBoundingClientRect().left).toBe(-space('12'));
    expect(popup).toHaveAttribute('data-swipe-direction', 'left');

    rerender(<Held open={false} />);
    await closed();
    document.documentElement.dir = 'rtl';
    rerender(<Held open />);
    popup = await settled();
    expect(popup.getBoundingClientRect().right).toBe(1200 + space('12'));
    expect(popup).toHaveAttribute('data-swipe-direction', 'right');
  });

  it("its own dir wins over the document's", async () => {
    await page.viewport(1200, 800);
    document.documentElement.dir = 'ltr';
    render(<Example defaultOpen content={{ side: 'start', dir: 'rtl' }} />);
    const popup = await settled();
    expect(popup.getBoundingClientRect().right).toBe(1200 + space('12'));
    expect(popup).toHaveAttribute('data-swipe-direction', 'right');
  });
});

describe('size', () => {
  it('widths follow the size.drawer tokens', async () => {
    await page.viewport(1200, 800);
    const sizes = { sm: 20, md: 28, lg: 40 } as const;
    for (const [size, count] of Object.entries(sizes)) {
      const { unmount } = render(
        <Example defaultOpen content={{ size: size as 'sm' | 'md' | 'lg' }} />,
      );
      const popup = await settled();
      expect(popup.getBoundingClientRect().width - space('12')).toBe(
        rem(count),
      );
      unmount();
      await closed();
    }
  });

  it('at 320 wide, the panel is 320 - space.8 wide', async () => {
    await page.viewport(320, 600);
    render(<Example defaultOpen content={{ size: 'lg' }} />);
    const popup = await settled();
    expect(popup.getBoundingClientRect().width - space('12')).toBe(
      320 - space('8'),
    );
  });
});

describe('appearance', () => {
  it('is full height with a border and rounded corners on the inner edge only', async () => {
    await page.viewport(1200, 800);
    render(<Example defaultOpen />);
    const popup = await settled();
    const style = getComputedStyle(popup);
    expect(popup.getBoundingClientRect().height).toBe(800);
    expect(style.borderLeftWidth).toBe('1px');
    expect(style.borderRightWidth).toBe('0px');
    expect(style.borderTopWidth).toBe('0px');
    const radius = `${px('var(--ds-radius-card)')}px`;
    expect(style.borderTopLeftRadius).toBe(radius);
    expect(style.borderBottomLeftRadius).toBe(radius);
    expect(style.borderTopRightRadius).toBe('0px');
    expect(style.borderBottomRightRadius).toBe('0px');
  });

  it('start in RTL sits on the physical right, with its border and corners on the physical left', async () => {
    await page.viewport(1200, 800);
    document.documentElement.dir = 'rtl';
    render(<Example defaultOpen content={{ side: 'start' }} />);
    const popup = await settled();
    const style = getComputedStyle(popup);
    const radius = `${px('var(--ds-radius-card)')}px`;
    expect(style.borderLeftWidth).toBe('1px');
    expect(style.borderRightWidth).toBe('0px');
    expect(style.borderTopLeftRadius).toBe(radius);
    expect(style.borderTopRightRadius).toBe('0px');
  });

  it('tall content scrolls inside the panel, not the page', async () => {
    await page.viewport(800, 400);
    render(
      <Drawer defaultOpen>
        <DrawerContent aria-label="Tall">
          {Array.from({ length: 40 }, (_, i) => (
            <p key={i}>Paragraph {i}</p>
          ))}
        </DrawerContent>
      </Drawer>,
    );
    const popup = await settled();
    const content = popup.firstElementChild as HTMLElement;
    expect(popup.getBoundingClientRect().height).toBe(400);
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    content.scrollTop = 100;
    expect(content.scrollTop).toBeGreaterThan(0);
  });
});

describe('modal behavior', () => {
  it('Tab goes through the controls in order and wraps inside the drawer', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    const popup = await settled();
    const name = screen.getByRole('textbox', { name: 'Name' });
    // The first focusable element gets focus, not the close button.
    await expect.poll(() => document.activeElement).toBe(name);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();
    await userEvent.tab();
    expect(closeButton()).toHaveFocus();
    await userEvent.tab();
    expect(popup.contains(document.activeElement)).toBe(true);
  });

  it('Shift+Tab from the first control stays inside the drawer', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    const popup = await settled();
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('textbox', { name: 'Name' }));
    await userEvent.tab({ shift: true });
    expect(popup.contains(document.activeElement)).toBe(true);
  });

  it('locks page scrolling', async () => {
    const tall = document.createElement('div');
    tall.style.cssText = 'height: 3000px; width: 100%;';
    document.body.append(tall);
    try {
      render(<Example />);
      await userEvent.click(trigger());
      await settled();
      const root = getComputedStyle(document.documentElement);
      expect(
        [root.overflowY, getComputedStyle(document.body).overflowY].includes(
          'hidden',
        ),
      ).toBe(true);
    } finally {
      tall.remove();
    }
  });
});

describe('closing', () => {
  // The dimmed area is the viewport's: it sits above the backdrop.
  const clickOutside = () =>
    userEvent.click(
      document.querySelector<HTMLElement>(`.${styles.viewport}`)!,
      { position: { x: 4, y: 4 } },
    );
  const closers = {
    Escape: () => userEvent.keyboard('{Escape}'),
    'a backdrop click': clickOutside,
    'the close button': () => userEvent.click(closeButton()),
    DrawerClose: () =>
      userEvent.click(screen.getByRole('button', { name: 'Done' })),
  };

  describe.each(Object.entries(closers))('%s', (_name, close) => {
    it('closes it and returns focus to the trigger', async () => {
      render(<Example content={{ side: 'end' }} />);
      await userEvent.click(trigger());
      await settled();
      await close();
      await closed();
      await expect.poll(() => document.activeElement).toBe(trigger());
    });

    it('returns focus to finalFocus when given', async () => {
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
      await close();
      await closed();
      await expect.poll(() => document.activeElement).toBe(ref.current);
    });
  });

  it('a backdrop click does not close it with closeOnOutsideClick={false}', async () => {
    render(<Example closeOnOutsideClick={false} />);
    await userEvent.click(trigger());
    await settled();
    await clickOutside();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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

  it('leaves nothing visible at the edge once closed', async () => {
    await page.viewport(1200, 800);
    render(<Example />);
    await userEvent.click(trigger());
    await settled();
    expect(
      document.elementFromPoint(1200 - 20, 400)?.closest('[role="dialog"]'),
    ).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await closed();
    expect(
      document.elementFromPoint(1200 - 20, 400)?.closest('[role="dialog"]'),
    ).toBeNull();
  });
});

describe('motion', () => {
  it('slides on transform, with the duration token', async () => {
    render(<Example defaultOpen />);
    const popup = await settled();
    const style = getComputedStyle(popup);
    expect(style.transitionProperty).toBe('transform');
    expect(style.transitionDuration).toBe(
      `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ds-motion-duration-base')) / 1000}s`,
    );
  });

  it.each(['end', 'start'] as const)(
    'the %s exit offset clears the panel, its border and its shadow',
    async (side) => {
      await page.viewport(1200, 800);
      const stage = document.createElement('div');
      stage.style.cssText = 'position: fixed; inset: 0; overflow: hidden;';
      const panel = document.createElement('div');
      panel.className = `${styles.popup} ${styles.sides[side]} ${styles.sizes.md}`;
      panel.setAttribute('data-ending-style', '');
      stage.append(panel);
      document.body.append(stage);
      try {
        const rect = panel.getBoundingClientRect();
        // The widest reach of any layer: its offset, blur, and spread.
        const reach = Math.max(
          ...getComputedStyle(panel)
            .boxShadow.split(/,(?![^(]*\))/)
            .map((layer) => {
              const [x, , blur, spread] = layer
                .replace(/rgba?\([^)]*\)/g, '')
                .match(/-?[\d.]+px/g)!
                .map(parseFloat);
              return Math.abs(x!) + blur! + spread!;
            }),
        );
        expect(reach).toBe(64);
        // The edge nearest the screen starts further off-screen than the shadow reaches.
        if (side === 'end') {
          expect(rect.left - 1200).toBeGreaterThanOrEqual(reach);
        } else {
          expect(0 - rect.right).toBeGreaterThanOrEqual(reach);
        }
      } finally {
        stage.remove();
      }
    },
  );

  it('reduced motion removes the transition, and it still closes', async () => {
    await emulate([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    render(<Example />);
    await userEvent.click(trigger());
    const popup = await settled();
    expect(getComputedStyle(popup).transitionDuration).toBe('0s');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await closed();
  });
});

describe('a long title', () => {
  // Short words, so every line fills to within a letter of its limit.
  const longTitle = 'a '.repeat(150);
  const heading = () => screen.getByRole('heading', { level: 2 });

  it('stays clear of the close button', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent size="sm">
          <DrawerTitle>{longTitle}</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await settled();
    // The text's own end edge, not the heading box's.
    const range = document.createRange();
    range.selectNodeContents(heading());
    const textEnd = Math.max(
      ...Array.from(range.getClientRects(), (r) => r.right),
    );
    expect(textEnd).toBeLessThanOrEqual(
      closeButton().getBoundingClientRect().left,
    );
  });

  it('uses the full width without a close button', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent size="sm" showClose={false}>
          <DrawerTitle>{longTitle}</DrawerTitle>
          <DrawerClose>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    const popup = await settled();
    const content = popup.firstElementChild as HTMLElement;
    expect(getComputedStyle(heading()).paddingInlineEnd).toBe('0px');
    expect(heading().getBoundingClientRect().right).toBe(
      content.getBoundingClientRect().right - space('6'),
    );
  });
});
