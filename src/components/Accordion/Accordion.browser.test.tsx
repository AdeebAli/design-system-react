import { act, render, screen } from '@testing-library/react';
import { cdp, page, userEvent } from 'vitest/browser';
import { vars } from '../../themes/contract.css';
import { Card } from '../Card';
import { Accordion, AccordionItem, type AccordionProps } from './index';

function Faq(props: Omit<AccordionProps, 'children'>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a" title="Billing" data-testid="a">
        Billing answer
      </AccordionItem>
      <AccordionItem value="b" title="Refunds" data-testid="b">
        Refunds answer
      </AccordionItem>
      <AccordionItem value="c" title="Legacy" disabled data-testid="c">
        Legacy answer
      </AccordionItem>
    </Accordion>
  );
}

const header = (name: string) => screen.getByRole('button', { name });

beforeEach(async () => {
  await page.viewport(800, 600);
});

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

it('Tab reaches each enabled header, and Enter and Space toggle it', async () => {
  render(
    <>
      <button type="button">Before</button>
      <Faq />
    </>,
  );
  screen.getByRole('button', { name: 'Before' }).focus();
  await userEvent.keyboard('{Tab}');
  expect(header('Billing')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  expect(header('Refunds')).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByTestId('b')).toHaveAttribute('data-open');
  await userEvent.keyboard(' ');
  expect(screen.getByTestId('b')).not.toHaveAttribute('data-open');
});

it('a disabled item cannot be opened', async () => {
  render(<Faq />);
  await userEvent.click(header('Legacy'), { force: true });
  expect(screen.getByTestId('c')).not.toHaveAttribute('data-open');
  expect(screen.queryByText('Legacy answer')).toBeNull();
});

it('beforematch on a keepMounted panel opens it', () => {
  render(<Faq keepMounted />);
  const panel = screen.getByText('Refunds answer').closest('[hidden]')!;
  expect(panel).toHaveAttribute('hidden', 'until-found');
  act(() => {
    panel.dispatchEvent(new Event('beforematch', { bubbles: true }));
  });
  expect(screen.getByTestId('b')).toHaveAttribute('data-open');
  expect(screen.getByText('Refunds answer')).toBeVisible();
});

it('the panel animates height and the chevron rotates, and reduced motion turns both off', async () => {
  render(<Faq defaultValue={['a']} />);
  const panel = screen.getByText('Billing answer').closest('[data-open]')!;
  const chevron = header('Billing').querySelector('svg')!;
  const durations = (element: Element) =>
    getComputedStyle(element)
      .transitionDuration.split(',')
      .map((d) => parseFloat(d));
  expect(getComputedStyle(panel).transitionProperty).toContain('height');
  expect(Math.max(...durations(panel))).toBeGreaterThan(0);
  expect(getComputedStyle(chevron).transitionProperty).toContain('transform');
  expect(Math.max(...durations(chevron))).toBeGreaterThan(0);
  expect(getComputedStyle(chevron).transform).not.toBe('none');
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  expect(durations(panel).every((d) => d === 0)).toBe(true);
  expect(durations(chevron).every((d) => d === 0)).toBe(true);
});

it('a closed item’s chevron is not rotated', () => {
  render(<Faq />);
  const chevron = header('Billing').querySelector('svg')!;
  expect(getComputedStyle(chevron).transform).toBe('none');
});

it.each([
  ['md', 44],
  ['sm', 32],
] as const)('headers are %s: %ipx tall', (size, height) => {
  render(<Faq size={size} />);
  expect(header('Billing').getBoundingClientRect().height).toBe(height);
});

it('headers are full width', () => {
  render(<Faq />);
  const item = screen.getByTestId('a').getBoundingClientRect();
  expect(header('Billing').getBoundingClientRect().width).toBe(item.width);
});

it('the focus ring is inset, so a clipping Card does not cut it off', async () => {
  render(
    <>
      <button type="button">Before</button>
      <Card clip padding="none" data-testid="card">
        <Faq />
      </Card>
    </>,
  );
  screen.getByRole('button', { name: 'Before' }).focus();
  await userEvent.keyboard('{Tab}');
  const trigger = header('Billing');
  expect(trigger).toHaveFocus();
  const style = getComputedStyle(trigger);
  expect(style.outlineStyle).toBe('solid');
  // How far the ring reaches past the border box.
  const reach =
    parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
  const ring = trigger.getBoundingClientRect();
  // The card clips to its padding box, inside its border.
  const card = screen.getByTestId('card');
  const box = card.getBoundingClientRect();
  const clip = {
    top: box.top + card.clientTop,
    left: box.left + card.clientLeft,
    right: box.left + card.clientLeft + card.clientWidth,
  };
  expect(ring.top).toBe(clip.top);
  expect(ring.top - reach).toBeGreaterThanOrEqual(clip.top);
  expect(ring.left - reach).toBeGreaterThanOrEqual(clip.left);
  expect(ring.right + reach).toBeLessThanOrEqual(clip.right);
});

it('items are separated by border.subtle lines', () => {
  render(<Faq />);
  const second = getComputedStyle(screen.getByTestId('b'));
  expect(second.borderTopStyle).toBe('solid');
  expect(second.borderTopWidth).toBe('1px');
  const probe = document.createElement('span');
  probe.style.color = vars.color.border.subtle;
  document.body.append(probe);
  expect(second.borderTopColor).toBe(getComputedStyle(probe).color);
  probe.remove();
  const first = getComputedStyle(screen.getByTestId('a'));
  expect(first.borderTopStyle).toBe('none');
});
