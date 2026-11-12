import { act, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { cdp, page, userEvent } from 'vitest/browser';
import { Tab, Tabs, TabsList, TabsPanel } from './index';
import * as styles from './Tabs.css';

const tab = (name: string) => screen.getByRole('tab', { name });
const selected = (name: string) => tab(name).getAttribute('aria-selected');

function Keyboard() {
  return (
    <Tabs defaultValue="a">
      <TabsList aria-label="Views">
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
        <Tab value="c" disabled>
          C
        </Tab>
        <Tab value="d">D</Tab>
      </TabsList>
      <TabsPanel value="a">Panel A</TabsPanel>
      <TabsPanel value="b">Panel B</TabsPanel>
      <TabsPanel value="d">Panel D</TabsPanel>
    </Tabs>
  );
}

it('arrow keys move focus without activating; Enter and Space activate', async () => {
  render(<Keyboard />);
  tab('A').focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(tab('B')).toHaveFocus();
  expect(selected('A')).toBe('true');
  expect(selected('B')).toBe('false');
  await userEvent.keyboard('{Enter}');
  expect(selected('B')).toBe('true');
  await userEvent.keyboard('{ArrowLeft}');
  expect(tab('A')).toHaveFocus();
  await userEvent.keyboard(' ');
  expect(selected('A')).toBe('true');
});

it('Home and End move focus to the ends', async () => {
  render(<Keyboard />);
  tab('A').focus();
  await userEvent.keyboard('{End}');
  expect(tab('D')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  expect(tab('A')).toHaveFocus();
});

it('a disabled tab cannot be activated from the keyboard', async () => {
  render(<Keyboard />);
  tab('B').focus();
  await userEvent.keyboard('{ArrowRight}');
  // Focus skips or lands on C; either way, Enter mustn't select it.
  await userEvent.keyboard('{Enter}');
  expect(selected('C')).not.toBe('true');
  expect(screen.getByRole('tabpanel')).not.toHaveTextContent('Panel C');
});

function Long() {
  const names = Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`);
  return (
    <Tabs defaultValue={names[0]!}>
      <TabsList aria-label="Sections">
        {names.map((name) => (
          <Tab key={name} value={name}>
            {name}
          </Tab>
        ))}
      </TabsList>
    </Tabs>
  );
}

it('at 320px a long list scrolls, the focused tab comes into view, and its focus ring is not clipped', async () => {
  await page.viewport(320, 600);
  render(<Long />);
  const list = screen.getByRole('tablist');
  expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  tab('Section 1').focus();
  await userEvent.keyboard('{End}');
  const last = tab('Section 12');
  expect(last).toHaveFocus();
  await expect.poll(() => list.scrollLeft).toBeGreaterThan(0);
  // The focus ring: a 2px outline offset by 2px, so 4px around the tab.
  const ring = last.getBoundingClientRect();
  const box = list.getBoundingClientRect();
  const style = getComputedStyle(list);
  const inner = {
    left: box.left + parseFloat(style.borderLeftWidth),
    right: box.right - parseFloat(style.borderRightWidth),
    top: box.top + parseFloat(style.borderTopWidth),
    bottom: box.top + parseFloat(style.borderTopWidth) + list.clientHeight,
  };
  expect(getComputedStyle(last).outlineStyle).toBe('solid');
  expect(ring.top - 4).toBeGreaterThanOrEqual(inner.top - 0.5);
  expect(ring.bottom + 4).toBeLessThanOrEqual(inner.bottom + 0.5);
  expect(ring.right + 4).toBeLessThanOrEqual(inner.right + 0.5);
});

describe.each(['underline', 'pill'] as const)('the %s marker', (variant) => {
  let container: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(async () => {
    await page.viewport(800, 600);
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(async () => {
    root?.unmount();
    root = undefined;
    container.remove();
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  function Marked() {
    return (
      <Tabs defaultValue="a" variant={variant}>
        <TabsList aria-label="Views">
          <Tab value="a">Overview</Tab>
          <Tab value="b">Recent activity</Tab>
        </TabsList>
      </Tabs>
    );
  }

  const indicator = () =>
    container.querySelector<HTMLElement>(`.${styles.indicator}`)!;
  const active = () => container.querySelector<HTMLElement>('[data-active]')!;

  // A pseudo-element has no getBoundingClientRect, so place it from its
  // computed offsets inside the tab, its containing block.
  function cssMarker(tab: HTMLElement) {
    const after = getComputedStyle(tab, '::after');
    const rect = tab.getBoundingClientRect();
    const left = rect.left + parseFloat(after.left);
    const top = rect.top + parseFloat(after.top);
    return {
      display: after.display,
      left,
      top,
      width: parseFloat(after.width),
      height: parseFloat(after.height),
    };
  }

  function round(rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
    return [rect.left, rect.top, rect.width, rect.height].map(
      (n) => Math.round(n * 2) / 2,
    );
  }

  async function hydrate() {
    container.innerHTML = renderToString(<Marked />);
    const before = cssMarker(active());
    act(() => {
      root = hydrateRoot(container, <Marked />);
    });
    await expect.poll(() => indicator().hidden).toBe(false);
    return before;
  }

  it('server HTML has the CSS marker and a hidden Indicator', () => {
    container.innerHTML = renderToString(<Marked />);
    expect(indicator()).toHaveAttribute('hidden');
    const marker = cssMarker(active());
    expect(marker.display).not.toBe('none');
    expect(marker.width).toBeGreaterThan(0);
    expect(marker.height).toBeGreaterThan(0);
  });

  it('after hydration, the Indicator matches the CSS marker, which turns off, with no animation', async () => {
    const before = await hydrate();
    expect(indicator().getAnimations()).toHaveLength(0);
    expect(round(indicator().getBoundingClientRect())).toEqual(round(before));
    expect(cssMarker(active()).display).toBe('none');
  });

  it('the Indicator sits under the active tab in RTL', async () => {
    container.dir = 'rtl';
    await hydrate();
    const indicatorRect = indicator().getBoundingClientRect();
    const tabRect = active().getBoundingClientRect();
    expect(Math.abs(indicatorRect.left - tabRect.left)).toBeLessThanOrEqual(
      0.5,
    );
    expect(Math.abs(indicatorRect.width - tabRect.width)).toBeLessThanOrEqual(
      0.5,
    );
  });

  it('switching tabs slides the Indicator', async () => {
    await hydrate();
    await userEvent.click(container.querySelectorAll('button')[1]!);
    const properties = indicator()
      .getAnimations()
      .map((animation) => (animation as CSSTransition).transitionProperty);
    expect(properties).toEqual(expect.arrayContaining(['transform', 'width']));
    await Promise.all(
      indicator()
        .getAnimations()
        .map((a) => a.finished),
    );
    expect(round(indicator().getBoundingClientRect())).toEqual(
      round(markerFor(active())),
    );
  });

  // Where the CSS marker would be for a tab, read with the Indicator hidden.
  function markerFor(tab: HTMLElement) {
    indicator().hidden = true;
    const marker = cssMarker(tab);
    indicator().hidden = false;
    return marker;
  }

  it('reduced motion turns the slide off', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await hydrate();
    const durations = getComputedStyle(indicator())
      .transitionDuration.split(',')
      .map((d) => parseFloat(d));
    expect(durations.every((d) => d === 0)).toBe(true);
  });

  it('hiding the Indicator again brings back the CSS marker', async () => {
    await hydrate();
    indicator().hidden = true;
    expect(cssMarker(active()).display).not.toBe('none');
  });

  it('stays aligned when the tabs resize, the window resizes, and the list scrolls', async () => {
    await hydrate();
    const aligned = async () => {
      await expect
        .poll(() => round(indicator().getBoundingClientRect()))
        .toEqual(round(markerFor(active())));
    };
    // A font loading changes text width; wider letter spacing stands in for it.
    container.style.letterSpacing = '4px';
    await aligned();
    await page.viewport(500, 600);
    await aligned();
    await page.viewport(320, 600);
    const list = container.querySelector<HTMLElement>('[role="tablist"]')!;
    list.scrollLeft = 40;
    await aligned();
  });

  it('forced colors: the Indicator uses Highlight', async () => {
    await hydrate();
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    const probe = document.createElement('span');
    probe.style.color = 'Highlight';
    document.body.append(probe);
    const highlight = getComputedStyle(probe).color;
    probe.remove();
    const style = getComputedStyle(indicator());
    const color =
      variant === 'underline' ? style.borderBottomColor : style.borderTopColor;
    expect(color).toBe(highlight);
  });
});

describe('document direction', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('ArrowLeft moves to the next tab in RTL', async () => {
    const { unmount } = render(<Keyboard />);
    tab('A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('B')).toHaveFocus();
    unmount();

    document.documentElement.dir = 'rtl';
    render(<Keyboard />);
    tab('A').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(tab('B')).toHaveFocus();
  });

  it('follows a root dir change after mount', async () => {
    render(<Keyboard />);
    tab('A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('B')).toHaveFocus();
    await act(async () => {
      document.documentElement.dir = 'rtl';
      // The observer's callback runs as a microtask after the mutation.
      await Promise.resolve();
    });
    tab('A').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(tab('B')).toHaveFocus();
  });
});
