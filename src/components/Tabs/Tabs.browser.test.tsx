import { render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { Tab, Tabs, TabsList, TabsPanel } from './index';

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
